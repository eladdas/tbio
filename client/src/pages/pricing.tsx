import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, XCircle, Shield, Clock, Headphones, Zap } from "lucide-react";
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  const { data: plansData, isLoading } = useQuery({
    queryKey: ["/api/plans"],
    queryFn: async () => {
      const res = await fetch("/api/plans");
      if (!res.ok) throw new Error("Failed to fetch plans");
      return res.json();
    },
  });

  const plans = plansData?.map((plan: any) => ({
    name: plan.name_ar, // Use Arabic name
    description: plan.description || "خطة مميزة لاحتياجاتك",
    monthlyPrice: plan.price_monthly / 100,
    yearlyPrice: plan.price_yearly / 100,
    features: Array.isArray(plan.features) ? plan.features : [],
    featured: plan.is_default,
    badge: plan.is_default ? "الأكثر شعبية" : undefined,
    id: plan.id, // Keep ID for keys if needed, though index is used currently
  })) || [];

  if (isLoading) {
    return (
      <MarketingLayout>
        <section className="py-12 md:py-20 bg-gradient-to-br from-[#f8f9fa] to-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-[400px] flex items-center justify-center">
                  <div className="animate-pulse flex flex-col items-center gap-4 w-full px-6">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2 w-full mt-8">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </MarketingLayout>
    );
  }

  const comparisonFeatures = [
    { name: "الكلمات المفتاحية", starter: "25", professional: "100", business: "500", enterprise: "غير محدود" },
    { name: "المواقع", starter: "1", professional: "5", business: "غير محدود", enterprise: "غير محدود" },
    { name: "تحديثات يومية", starter: true, professional: true, business: true, enterprise: true },
    { name: "فحوصات عند الطلب", starter: true, professional: true, business: true, enterprise: true },
    { name: "تقارير أساسية", starter: true, professional: true, business: true, enterprise: true },
    { name: "تقارير متقدمة", starter: false, professional: true, business: true, enterprise: true },
    { name: "تقارير بالشعار الخاص", starter: false, professional: true, business: true, enterprise: true },
    { name: "تنبيهات مخصصة", starter: false, professional: true, business: true, enterprise: true },
    { name: "API وصول", starter: false, professional: true, business: true, enterprise: true },
    { name: "دعم البريد", starter: true, professional: true, business: true, enterprise: true },
    { name: "دعم أولوية", starter: false, professional: true, business: true, enterprise: true },
    { name: "مدير حساب", starter: false, professional: false, business: true, enterprise: true },
    { name: "SLA مخصص", starter: false, professional: false, business: false, enterprise: true },
    { name: "استشارات SEO", starter: false, professional: false, business: false, enterprise: true },
  ];

  const faqs = [
    {
      question: "ما هي طرق الدفع المتاحة؟",
      answer: "نقبل جميع بطاقات الائتمان الرئيسية (Visa، Mastercard، American Express) وPayPal. للخطط المؤسساتية، نوفر أيضاً خيارات الفواتير والدفع عبر التحويل البنكي.",
    },
    {
      question: "هل يمكنني تغيير خطتي لاحقاً؟",
      answer: "نعم، يمكنك الترقية أو التخفيض في أي وقت. عند الترقية، ستحصل على ميزات الخطة الجديدة فوراً. عند التخفيض، ستستمر الخطة الحالية حتى نهاية دورة الفوترة.",
    },
    {
      question: "هل هناك فترة تجريبية مجانية؟",
      answer: "نعم، نقدم فترة تجريبية مجانية لمدة 14 يوماً لجميع الخطط المدفوعة. لا حاجة لبطاقة ائتمان للبدء. يمكنك إلغاء الاشتراك في أي وقت خلال الفترة التجريبية دون أي رسوم.",
    },
    {
      question: "ماذا يحدث إذا تجاوزت حدود خطتي؟",
      answer: "سنرسل لك إشعاراً عندما تقترب من حدود خطتك. يمكنك الترقية في أي وقت للحصول على المزيد من الموارد. لن نوقف خدمتك بشكل مفاجئ، ولكن قد تحتاج إلى الترقية لإضافة المزيد من الكلمات المفتاحية أو المواقع.",
    },
    {
      question: "هل تقدمون خصومات للمؤسسات التعليمية أو غير الربحية؟",
      answer: "نعم، نقدم خصومات خاصة للمؤسسات التعليمية والمنظمات غير الربحية. يرجى التواصل مع فريق المبيعات لدينا للحصول على عرض سعر مخصص.",
    },
    {
      question: "هل يمكنني إلغاء اشتراكي في أي وقت؟",
      answer: "نعم، يمكنك إلغاء اشتراكك في أي وقت من لوحة التحكم. عند الإلغاء، ستحتفظ بالوصول إلى جميع ميزات خطتك حتى نهاية دورة الفوترة الحالية. لا توجد رسوم إلغاء.",
    },
    {
      question: "هل البيانات محمية وآمنة؟",
      answer: "نعم، نستخدم تشفير SSL على مستوى البنوك لحماية جميع بياناتك. جميع البيانات يتم نسخها احتياطياً بشكل منتظم. نحن ملتزمون بمعايير الأمان العالية ونتبع أفضل الممارسات في حماية البيانات.",
    },
    {
      question: "هل يمكنني الحصول على استرداد للمبلغ المدفوع؟",
      answer: "نعم، نقدم ضمان استرداد المال لمدة 30 يوماً على جميع الخطط. إذا لم تكن راضياً عن الخدمة خلال أول 30 يوماً، يمكنك طلب استرداد كامل للمبلغ المدفوع.",
    },
  ];

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-[#8bc34a]/85 via-[#4caf50]/90 to-[#2e7d32]/85 py-12 md:py-28"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(139, 195, 74, 0.85) 0%, rgba(76, 175, 80, 0.90) 100%), url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2000&q=80')`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`,
            backgroundSize: '60px 60px'
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }} data-testid="text-pricing-hero-title">
              خطط أسعار بسيطة وواضحة
            </h1>
            <p className="text-lg md:text-xl text-white mb-8 font-normal" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }} data-testid="text-pricing-hero-subtitle">
              ابدأ في تحسين ترتيبك اليوم مع أدواتنا القوية
            </p>
            <p className="text-base md:text-lg text-white/95 mb-10 max-w-2xl mx-auto font-normal" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }} data-testid="text-pricing-hero-note">
              بدون رسوم خفية، يمكنك الإلغاء في أي وقت
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
              <span
                className={`text-base md:text-lg font-semibold transition-colors ${!isYearly ? 'text-white' : 'text-white/70'}`}
                data-testid="text-billing-monthly"
              >
                شهري
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-16 h-8 rounded-full transition-colors ${isYearly ? 'bg-white/30' : 'bg-white/30'}`}
                data-testid="button-billing-toggle"
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isYearly ? 'translate-x-[-34px]' : 'translate-x-[-2px]'
                    }`}
                />
              </button>
              <span
                className={`text-base md:text-lg font-semibold transition-colors ${isYearly ? 'text-white' : 'text-white/70'}`}
                data-testid="text-billing-yearly"
              >
                سنوي
              </span>
              <Badge className="bg-white text-[#4caf50] hover:bg-white/90 font-bold text-sm px-4 py-1" data-testid="badge-discount">
                وفّر 20%
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-[#f8f9fa] to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
            {plans.map((plan: any, index: number) => (
              <Card
                key={index}
                className={`relative hover:-translate-y-3 transition-all duration-300 shadow-lg hover:shadow-2xl ${plan.featured
                  ? 'border-3 border-[#4caf50] scale-105 bg-gradient-to-br from-white to-[#f1f8e9]'
                  : 'bg-white'
                  }`}
                data-testid={`card-plan-${index}`}
              >
                {plan.badge && (
                  <Badge
                    className="absolute -top-3 right-6 bg-gradient-to-r from-[#8bc34a] to-[#4caf50] text-white px-4 py-1 shadow-md"
                    data-testid={`badge-plan-${index}`}
                  >
                    {plan.badge}
                  </Badge>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl md:text-3xl text-[#2e7d32] mb-3" data-testid={`title-plan-${index}`}>
                    {plan.name}
                  </CardTitle>
                  <p className="text-sm md:text-base text-muted-foreground font-normal min-h-[48px]" data-testid={`desc-plan-${index}`}>
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="py-6 border-t-2 border-b-2 border-border">
                    {plan.customPrice ? (
                      <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-[#4caf50]" data-testid={`price-plan-${index}`}>
                          تواصل معنا
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">للحصول على عرض سعر</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-4xl md:text-5xl font-bold text-[#4caf50] text-center" data-testid={`price-plan-${index}`}>
                          {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                          <span className="text-lg md:text-xl text-muted-foreground font-normal"> ريال/شهر</span>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground text-center mt-2">
                          أقل من {Math.ceil(((isYearly ? plan.yearlyPrice : plan.monthlyPrice) || 0) / 30)} ريال/يوم
                        </p>
                      </>
                    )}
                  </div>

                  <ul className="space-y-3 text-right">
                    {plan.features.map((feature: any, featureIndex: number) => (
                      <li
                        key={featureIndex}
                        className={`flex items-start gap-3 text-sm md:text-base ${feature.included ? 'text-foreground' : 'text-muted-foreground/40'
                          }`}
                        data-testid={`feature-plan-${index}-${featureIndex}`}
                      >
                        {feature.included ? (
                          <CheckCircle2 className="w-5 h-5 text-[#4caf50] flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                        )}
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full py-6 text-base md:text-lg font-bold shadow-md ${plan.featured
                      ? 'bg-gradient-to-r from-[#8bc34a] to-[#4caf50] text-white'
                      : 'bg-white text-[#4caf50] border-2 border-[#4caf50]'
                      }`}
                    data-testid={`button-plan-${index}`}
                  >
                    {plan.customPrice ? 'تواصل معنا' : 'ابدأ الآن'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#2e7d32] mb-6" data-testid="text-comparison-title">
            مقارنة تفصيلية بين الخطط
          </h2>
          <p className="text-center text-base md:text-lg text-muted-foreground font-normal mb-8 md:mb-12 max-w-3xl mx-auto" data-testid="text-comparison-subtitle">
            قارن بين جميع الميزات لاختيار الخطة المناسبة لك
          </p>

          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-xl rounded-2xl overflow-hidden" data-testid="table-comparison">
              <thead className="bg-gradient-to-r from-[#8bc34a] to-[#4caf50] text-white">
                <tr>
                  <th className="py-6 px-4 md:px-6 text-right font-bold text-base md:text-lg" data-testid="header-feature">الميزة</th>
                  <th className="py-6 px-4 md:px-6 text-center font-bold text-base md:text-lg" data-testid="header-starter">المبتدئ</th>
                  <th className="py-6 px-4 md:px-6 text-center font-bold text-base md:text-lg" data-testid="header-professional">المحترف</th>
                  <th className="py-6 px-4 md:px-6 text-center font-bold text-base md:text-lg" data-testid="header-business">المؤسسات</th>
                  <th className="py-6 px-4 md:px-6 text-center font-bold text-base md:text-lg" data-testid="header-enterprise">المخصص</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr
                    key={index}
                    className="border-b border-border hover:bg-[#f9fbe7] transition-colors"
                    data-testid={`row-comparison-${index}`}
                  >
                    <td className="py-5 px-4 md:px-6 text-right font-semibold text-[#2e7d32] text-sm md:text-base" data-testid={`feature-name-${index}`}>
                      {feature.name}
                    </td>
                    <td className="py-5 px-4 md:px-6 text-center text-sm md:text-base" data-testid={`feature-starter-${index}`}>
                      {typeof feature.starter === 'boolean' ? (
                        feature.starter ? (
                          <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#4caf50] mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        feature.starter
                      )}
                    </td>
                    <td className="py-5 px-4 md:px-6 text-center text-sm md:text-base" data-testid={`feature-professional-${index}`}>
                      {typeof feature.professional === 'boolean' ? (
                        feature.professional ? (
                          <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#4caf50] mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        feature.professional
                      )}
                    </td>
                    <td className="py-5 px-4 md:px-6 text-center text-sm md:text-base" data-testid={`feature-business-${index}`}>
                      {typeof feature.business === 'boolean' ? (
                        feature.business ? (
                          <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#4caf50] mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        feature.business
                      )}
                    </td>
                    <td className="py-5 px-4 md:px-6 text-center text-sm md:text-base" data-testid={`feature-enterprise-${index}`}>
                      {typeof feature.enterprise === 'boolean' ? (
                        feature.enterprise ? (
                          <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#4caf50] mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        feature.enterprise
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#f8f9fa] to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Shield className="w-8 h-8 md:w-10 md:h-10 text-[#4caf50]" />,
                title: "أمان مضمون",
                description: "تشفير SSL وحماية البيانات",
              },
              {
                icon: <Clock className="w-8 h-8 md:w-10 md:h-10 text-[#4caf50]" />,
                title: "ضمان استرداد المال",
                description: "30 يوماً بدون أسئلة",
              },
              {
                icon: <Headphones className="w-8 h-8 md:w-10 md:h-10 text-[#4caf50]" />,
                title: "دعم 24/7",
                description: "فريق دعم جاهز للمساعدة",
              },
              {
                icon: <Zap className="w-8 h-8 md:w-10 md:h-10 text-[#4caf50]" />,
                title: "تحديثات مستمرة",
                description: "ميزات جديدة باستمرار",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow"
                data-testid={`trust-item-${index}`}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] flex items-center justify-center" data-testid={`icon-trust-${index}`}>
                  {item.icon}
                </div>
                <h4 className="text-lg md:text-xl font-bold text-[#2e7d32] mb-2" data-testid={`title-trust-${index}`}>
                  {item.title}
                </h4>
                <p className="text-sm md:text-base text-muted-foreground font-normal" data-testid={`desc-trust-${index}`}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-[#f9fbe7] to-[#f1f8e9]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#2e7d32] mb-6" data-testid="text-faq-title">
            الأسئلة الشائعة
          </h2>
          <p className="text-center text-base md:text-lg text-muted-foreground font-normal mb-8 md:mb-12 max-w-3xl mx-auto" data-testid="text-faq-subtitle">
            إجابات على الأسئلة الأكثر شيوعاً حول خطط الأسعار
          </p>

          <Accordion type="single" collapsible className="max-w-4xl mx-auto space-y-4" data-testid="accordion-faq">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-2xl shadow-md overflow-hidden border-none"
                data-testid={`faq-item-${index}`}
              >
                <AccordionTrigger className="px-6 md:px-8 py-6 text-right hover:bg-[#f5f5f5] hover:no-underline transition-colors text-base md:text-lg font-semibold text-[#2e7d32]" data-testid={`button-faq-${index}`}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 md:px-8 pb-6 text-muted-foreground leading-relaxed text-sm md:text-base" data-testid={`answer-faq-${index}`}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-[#2e7d32] to-[#4caf50] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" data-testid="text-cta-title">
            هل أنت مستعد للبدء؟
          </h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-95" data-testid="text-cta-subtitle">
            ابدأ تجربتك المجانية اليوم ولا حاجة لبطاقة ائتمان
          </p>
          <Button
            size="lg"
            className="bg-white text-[#4caf50] hover:bg-white/90 shadow-2xl px-10 py-7 text-xl font-bold"
            data-testid="button-cta-start"
            asChild
          >
            <a href="/api/login">ابدأ تجربتك المجانية</a>
          </Button>
        </div>
      </section>
    </MarketingLayout>
  );
}
