import { GoogleGenAI, Type } from "@google/genai";
import { storage } from "./storage";

async function getAIClient() {
  let apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
  const dbSetting = await storage.getSystemSetting("google_gemini_api_key");

  if (dbSetting?.value) {
    apiKey = dbSetting.value;
  }

  if (!apiKey) {
    throw new Error("Gemini API Key is not configured. Please contact the administrator.");
  }

  return new GoogleGenAI({
    apiKey,
    ...(process.env.AI_INTEGRATIONS_GEMINI_BASE_URL ? {
      httpOptions: {
        apiVersion: "v1beta",
        baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
      }
    } : {})
  });
}

interface KeywordResult {
  keyword: string;
  searchIntent: string;
  difficulty: string;
  estimatedVolume: string;
  kgr?: number;
  competitorCount?: number;
  reasoning: string;
}

interface ResearchResult {
  keywords: KeywordResult[];
  strategy: string;
  summary: string;
}

interface LSIKeyword {
  keyword: string;
  relevance: string;
  usage: string;
}

interface LSICluster {
  mainKeyword: string;
  lsiKeywords: LSIKeyword[];
  contentStrategy: string;
  topicCoverage: string[];
}

export async function generateKeywordsWithStrategy(
  seedKeywords: string[],
  targetLocation: string,
  strategy: string
): Promise<ResearchResult> {
  // Try Google Ads first
  try {
    const { generateKeywordsWithGoogleAds } = await import("./googleAdsService");
    const googleResults = await generateKeywordsWithGoogleAds(seedKeywords, targetLocation);

    if (googleResults && googleResults.length > 0) {
      // Map Google Ads results to ResearchResult format
      const keywords: KeywordResult[] = googleResults.map((item: any) => ({
        keyword: item.keyword,
        searchIntent: "تجاري/معلوماتي", // Default estimation
        difficulty: item.difficulty,
        estimatedVolume: item.metrics.avgMonthlySearches.toString(),
        reasoning: "بيانات حقيقية من Google Keyword Planner: " +
          `حجم البحث: ${item.metrics.avgMonthlySearches}, ` +
          `المنافسة: ${item.metrics.competition}, ` +
          `سعر النقرة: ${item.metrics.lowTopOfPageBid} - ${item.metrics.highTopOfPageBid}`
      }));

      // Apply strategy filtering if needed (e.g., KGR)
      // For now, return the raw real data as it's more valuable

      return {
        keywords: keywords.slice(0, 50), // Limit to 50 results
        strategy,
        summary: "تم جلب الكلمات المفتاحية بنجاح من Google Keyword Planner (بيانات حقيقية)",
      };
    }
  } catch (error) {
    console.log("Google Ads API not configured or failed, falling back to Gemini:", error);
    // Fallback to Gemini below
  }

  const ai = await getAIClient();

  const strategyPrompts: Record<string, string> = {
    kgr: `استخدم استراتيجية KGR (Keyword Golden Ratio) للعثور على كلمات مفتاحية ذهبية.
    - KGR = (عدد نتائج Google مع الكلمة في العنوان) / (حجم البحث الشهري)
    - اختر كلمات بـ KGR أقل من 0.25 (سهلة الترتيب)
    - ركز على كلمات بحجم بحث 250-1000 شهرياً
    - اختر كلمات طويلة (3-5 كلمات) بمنافسة منخفضة`,

    longtail: `استخدم استراتيجية Longtail Keywords للعثور على كلمات طويلة ومحددة.
    - اختر كلمات من 3-6 كلمات
    - ركز على الكلمات المحددة جداً
    - ابحث عن كلمات بنية شرائية واضحة
    - استهدف الكلمات ذات المنافسة المنخفضة والحجم المعتدل`,

    question_based: `استخدم استراتيجية Question-Based Keywords للعثور على أسئلة يطرحها المستخدمون.
    - ركز على الأسئلة التي تبدأ بـ: كيف، ما، متى، أين، لماذا، هل
    - ابحث عن أسئلة شائعة في المجال
    - استهدف الكلمات التي تحل مشاكل حقيقية
    - ركز على نية البحث المعلوماتية`,

    competitor_analysis: `استخدم استراتيجية Competitor Analysis للعثور على كلمات ينافس عليها المنافسون.
    - حلل الكلمات التي قد يستخدمها المنافسون
    - ركز على الفجوات والفرص
    - ابحث عن كلمات ذات قيمة تجارية عالية
    - استهدف كلمات بتوازن بين الحجم والمنافسة`,

    semantic: `استخدم استراتيجية Semantic Keywords للعثور على كلمات ذات صلة دلالية.
    - ابحث عن مرادفات ومتغيرات
    - استخدم الكلمات المرتبطة بالموضوع
    - ركز على LSI keywords (Latent Semantic Indexing)
    - اختر كلمات تدعم السياق والموضوع الرئيسي`,
  };

  const prompt = `${strategyPrompts[strategy] || strategyPrompts.longtail}

الكلمات الأساسية: ${seedKeywords.join(", ")}
الدولة المستهدفة: ${targetLocation}

قم بتوليد 20-30 كلمة مفتاحية متنوعة وقيمة باستخدام الاستراتيجية المحددة.
لكل كلمة مفتاحية، قدم:
1. الكلمة المفتاحية
2. نية البحث (معلوماتية، تجارية، ملاحية، تحويلية)
3. مستوى الصعوبة (سهل، متوسط، صعب)
4. حجم البحث المقدر (منخفض: <500، متوسط: 500-5000، عالي: >5000)
${strategy === 'kgr' ? '5. نسبة KGR المقدرة (إذا أمكن)' : ''}
6. سبب اختيار هذه الكلمة

تأكد من أن الكلمات:
- ذات صلة بالكلمات الأساسية
- مناسبة للسوق في ${targetLocation}
- متنوعة وتغطي جوانب مختلفة
- قابلة للتطبيق والاستخدام الفعلي`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  searchIntent: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  estimatedVolume: { type: Type.STRING },
                  ...(strategy === 'kgr' && { kgr: { type: Type.NUMBER } }),
                  ...(strategy === 'competitor_analysis' && { competitorCount: { type: Type.NUMBER } }),
                  reasoning: { type: Type.STRING },
                },
                required: ["keyword", "searchIntent", "difficulty", "estimatedVolume", "reasoning"],
              },
            },
            summary: { type: Type.STRING },
          },
          required: ["keywords", "summary"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");

    return {
      keywords: result.keywords || [],
      strategy,
      summary: result.summary || "تم إنشاء الكلمات المفتاحية بنجاح",
    };
  } catch (error) {
    console.error("Error generating keywords with Gemini:", error);
    throw new Error("فشل في توليد الكلمات المفتاحية. يرجى المحاولة مرة أخرى.");
  }
}

export async function analyzeKeywordOpportunities(
  keywords: KeywordResult[],
  targetLocation: string
): Promise<string> {
  const ai = await getAIClient();
  const prompt = `قم بتحليل الكلمات المفتاحية التالية وتقديم توصيات استراتيجية:

الكلمات: ${keywords.map(k => k.keyword).join(", ")}
الدولة المستهدفة: ${targetLocation}

قدم:
1. أفضل 5 كلمات مفتاحية للبدء
2. استراتيجية المحتوى المقترحة
3. نصائح لتحسين محركات البحث
4. تحذيرات أو نقاط انتباه`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "لا يوجد تحليل متاح";
  } catch (error) {
    console.error("Error analyzing keywords:", error);
    return "فشل في تحليل الكلمات المفتاحية";
  }
}

export async function generateLSICluster(
  mainKeyword: string,
  targetLocation: string,
  contentType: string = "مقال شامل"
): Promise<LSICluster> {
  const ai = await getAIClient();
  const prompt = `أنت خبير في تحسين محركات البحث (SEO) والكلمات المفتاحية LSI.

الكلمة المفتاحية الرئيسية: "${mainKeyword}"
الدولة المستهدفة: ${targetLocation}
نوع المحتوى: ${contentType}

قم بإنشاء مجموعة من الكلمات المفتاحية LSI (Latent Semantic Indexing) التي يجب استخدامها مع الكلمة الرئيسية في المحتوى.

المطلوب:
1. 15-20 كلمة مفتاحية LSI مرتبطة دلالياً بالكلمة الرئيسية
2. لكل كلمة LSI:
   - الكلمة نفسها
   - مدى الصلة بالكلمة الرئيسية (عالية، متوسطة، داعمة)
   - كيفية استخدامها في المحتوى (مثال: في المقدمة، في العناوين الفرعية، في الفقرات)
3. استراتيجية المحتوى: كيف تستخدم هذه المجموعة لبناء محتوى قوي
4. المواضيع المشمولة: قائمة بالمواضيع الفرعية التي يجب تغطيتها

تأكد من أن الكلمات LSI:
- مرتبطة طبيعياً بالموضوع الرئيسي
- متنوعة وتغطي جوانب مختلفة
- مناسبة للسوق في ${targetLocation}
- تساعد في بناء محتوى شامل وغني`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lsiKeywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  relevance: { type: Type.STRING },
                  usage: { type: Type.STRING },
                },
                required: ["keyword", "relevance", "usage"],
              },
            },
            contentStrategy: { type: Type.STRING },
            topicCoverage: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["lsiKeywords", "contentStrategy", "topicCoverage"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");

    return {
      mainKeyword,
      lsiKeywords: result.lsiKeywords || [],
      contentStrategy: result.contentStrategy || "",
      topicCoverage: result.topicCoverage || [],
    };
  } catch (error) {
    console.error("Error generating LSI cluster:", error);
    throw new Error("فشل في توليد مجموعة الكلمات المفتاحية LSI");
  }
}
