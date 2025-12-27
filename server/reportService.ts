import { storage } from "./storage";
import { type Keyword, type Domain, type KeywordRanking, type WhiteLabelSetting } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ReportData {
  keywords: Array<Keyword & { domain: Domain; latestRanking?: KeywordRanking }>;
  whiteLabelSettings?: WhiteLabelSetting | null;
  generatedAt: Date;
  useWhiteLabel: boolean;
}

export async function generateKeywordsReportHTML(
  userId: string,
  keywordIds: string[],
  useWhiteLabel: boolean = false
): Promise<string> {
  // Get user's keywords and white label settings
  const allKeywords = await storage.getUserKeywordsEnriched(userId);
  const filteredKeywords = keywordIds.length > 0
    ? allKeywords.filter((k: any) => keywordIds.includes(k.id))
    : allKeywords;

  const whiteLabelSettings = useWhiteLabel
    ? await storage.getUserWhiteLabelSettings(userId)
    : null;

  // Get latest rankings for each keyword
  const keywordsWithRankings = await Promise.all(
    filteredKeywords.map(async (keyword: any) => {
      const latestRanking = await storage.getLatestKeywordRanking(keyword.id);
      return {
        ...keyword,
        latestRanking,
      };
    })
  );

  const reportData: ReportData = {
    keywords: keywordsWithRankings,
    whiteLabelSettings,
    generatedAt: new Date(),
    useWhiteLabel,
  };

  return generateReportHTMLTemplate(reportData);
}

function generateReportHTMLTemplate(data: ReportData): string {
  const brandColor = data.whiteLabelSettings?.report_primary_color || "#4caf50";
  const companyName = data.whiteLabelSettings?.company_name || "ترتيب";
  const companyDomain = data.whiteLabelSettings?.company_domain || "";
  const companyEmail = data.whiteLabelSettings?.company_email || "";
  const companyLogo = data.whiteLabelSettings?.company_logo_url || "";

  const formattedDate = format(data.generatedAt, "PPP", { locale: ar });

  const keywordsRows = data.keywords
    .map((kw) => {
      const position = kw.latestRanking?.position || "-";
      const positionText = position === "-" ? "غير موجود" : `#${position}`;
      const url = kw.latestRanking?.url || "-";
      const checkedAt = kw.latestRanking?.checked_at
        ? format(new Date(kw.latestRanking.checked_at), "PPP - p", { locale: ar })
        : "-";

      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${kw.keyword}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${kw.domain.domain}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-weight: bold; color: ${brandColor};">${positionText}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-size: 0.85em; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${url}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #666;">${checkedAt}</td>
        </tr>
      `;
    })
    .join("");

  const totalKeywords = data.keywords.length;
  const rankedKeywords = data.keywords.filter((k) => k.latestRanking?.position).length;
  const avgPosition =
    rankedKeywords > 0
      ? (
          data.keywords.reduce((sum, k) => sum + (k.latestRanking?.position || 0), 0) /
          rankedKeywords
        ).toFixed(1)
      : "-";

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير ترتيب الكلمات المفتاحية - ${companyName}</title>
    <link href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'El Messiri', sans-serif;
            background: #f5f5f5;
            padding: 20px;
            direction: rtl;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            border-bottom: 3px solid ${brandColor};
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header h1 {
            font-size: 28px;
            color: ${brandColor};
        }
        .logo {
            max-height: 60px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            border-right: 4px solid ${brandColor};
        }
        .stat-card h3 {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
        }
        .stat-card p {
            font-size: 32px;
            font-weight: bold;
            color: ${brandColor};
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th {
            background: ${brandColor};
            color: white;
            padding: 12px;
            text-align: right;
            font-weight: 600;
        }
        td {
            text-align: right;
        }
        .footer {
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .footer strong {
            color: ${brandColor};
        }
        @media print {
            body {
                padding: 0;
                background: white;
            }
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1>${companyName}</h1>
                <p style="color: #666; margin-top: 8px;">تقرير ترتيب الكلمات المفتاحية</p>
            </div>
            ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="logo">` : ""}
        </div>

        <div class="stats">
            <div class="stat-card">
                <h3>إجمالي الكلمات</h3>
                <p>${totalKeywords}</p>
            </div>
            <div class="stat-card">
                <h3>كلمات مرتبة</h3>
                <p>${rankedKeywords}</p>
            </div>
            <div class="stat-card">
                <h3>متوسط الترتيب</h3>
                <p>${avgPosition}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>الكلمة المفتاحية</th>
                    <th>النطاق</th>
                    <th>الترتيب</th>
                    <th>الرابط</th>
                    <th>آخر فحص</th>
                </tr>
            </thead>
            <tbody>
                ${keywordsRows}
            </tbody>
        </table>

        <div class="footer">
            <p><strong>تاريخ التقرير:</strong> ${formattedDate}</p>
            ${data.useWhiteLabel && companyDomain ? `<p style="margin-top: 8px;"><strong>الموقع:</strong> ${companyDomain}</p>` : ""}
            ${data.useWhiteLabel && companyEmail ? `<p style="margin-top: 4px;"><strong>البريد الإلكتروني:</strong> ${companyEmail}</p>` : ""}
            ${!data.useWhiteLabel ? `<p style="margin-top: 8px;">تم إنشاء هذا التقرير بواسطة <strong style="color: ${brandColor};">ترتيب</strong> - متتبع ترتيب الكلمات المفتاحية</p>` : ""}
        </div>
    </div>
</body>
</html>
`;
}
