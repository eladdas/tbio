export interface Country {
  code: string;
  name: string;
  nameAr: string;
  flag: string;
}

export const countries: Country[] = [
  { code: "SA", name: "Saudi Arabia", nameAr: "السعودية", flag: "🇸🇦" },
  { code: "AE", name: "United Arab Emirates", nameAr: "الإمارات", flag: "🇦🇪" },
  { code: "EG", name: "Egypt", nameAr: "مصر", flag: "🇪🇬" },
  { code: "JO", name: "Jordan", nameAr: "الأردن", flag: "🇯🇴" },
  { code: "KW", name: "Kuwait", nameAr: "الكويت", flag: "🇰🇼" },
  { code: "QA", name: "Qatar", nameAr: "قطر", flag: "🇶🇦" },
  { code: "BH", name: "Bahrain", nameAr: "البحرين", flag: "🇧🇭" },
  { code: "OM", name: "Oman", nameAr: "عمان", flag: "🇴🇲" },
  { code: "LB", name: "Lebanon", nameAr: "لبنان", flag: "🇱🇧" },
  { code: "IQ", name: "Iraq", nameAr: "العراق", flag: "🇮🇶" },
  { code: "SY", name: "Syria", nameAr: "سوريا", flag: "🇸🇾" },
  { code: "YE", name: "Yemen", nameAr: "اليمن", flag: "🇾🇪" },
  { code: "PS", name: "Palestine", nameAr: "فلسطين", flag: "🇵🇸" },
  { code: "MA", name: "Morocco", nameAr: "المغرب", flag: "🇲🇦" },
  { code: "DZ", name: "Algeria", nameAr: "الجزائر", flag: "🇩🇿" },
  { code: "TN", name: "Tunisia", nameAr: "تونس", flag: "🇹🇳" },
  { code: "LY", name: "Libya", nameAr: "ليبيا", flag: "🇱🇾" },
  { code: "SD", name: "Sudan", nameAr: "السودان", flag: "🇸🇩" },
  { code: "MR", name: "Mauritania", nameAr: "موريتانيا", flag: "🇲🇷" },
  { code: "SO", name: "Somalia", nameAr: "الصومال", flag: "🇸🇴" },
  { code: "DJ", name: "Djibouti", nameAr: "جيبوتي", flag: "🇩🇯" },
  { code: "KM", name: "Comoros", nameAr: "جزر القمر", flag: "🇰🇲" },
  
  // دول أخرى مهمة
  { code: "US", name: "United States", nameAr: "الولايات المتحدة", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", nameAr: "المملكة المتحدة", flag: "🇬🇧" },
  { code: "CA", name: "Canada", nameAr: "كندا", flag: "🇨🇦" },
  { code: "AU", name: "Australia", nameAr: "أستراليا", flag: "🇦🇺" },
  { code: "DE", name: "Germany", nameAr: "ألمانيا", flag: "🇩🇪" },
  { code: "FR", name: "France", nameAr: "فرنسا", flag: "🇫🇷" },
  { code: "IT", name: "Italy", nameAr: "إيطاليا", flag: "🇮🇹" },
  { code: "ES", name: "Spain", nameAr: "إسبانيا", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", nameAr: "هولندا", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", nameAr: "بلجيكا", flag: "🇧🇪" },
  { code: "SE", name: "Sweden", nameAr: "السويد", flag: "🇸🇪" },
  { code: "NO", name: "Norway", nameAr: "النرويج", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", nameAr: "الدنمارك", flag: "🇩🇰" },
  { code: "FI", name: "Finland", nameAr: "فنلندا", flag: "🇫🇮" },
  { code: "CH", name: "Switzerland", nameAr: "سويسرا", flag: "🇨🇭" },
  { code: "AT", name: "Austria", nameAr: "النمسا", flag: "🇦🇹" },
  { code: "PL", name: "Poland", nameAr: "بولندا", flag: "🇵🇱" },
  { code: "CZ", name: "Czech Republic", nameAr: "التشيك", flag: "🇨🇿" },
  { code: "HU", name: "Hungary", nameAr: "المجر", flag: "🇭🇺" },
  { code: "RO", name: "Romania", nameAr: "رومانيا", flag: "🇷🇴" },
  { code: "BG", name: "Bulgaria", nameAr: "بلغاريا", flag: "🇧🇬" },
  { code: "GR", name: "Greece", nameAr: "اليونان", flag: "🇬🇷" },
  { code: "PT", name: "Portugal", nameAr: "البرتغال", flag: "🇵🇹" },
  { code: "TR", name: "Turkey", nameAr: "تركيا", flag: "🇹🇷" },
  { code: "RU", name: "Russia", nameAr: "روسيا", flag: "🇷🇺" },
  { code: "UA", name: "Ukraine", nameAr: "أوكرانيا", flag: "🇺🇦" },
  { code: "IN", name: "India", nameAr: "الهند", flag: "🇮🇳" },
  { code: "PK", name: "Pakistan", nameAr: "باكستان", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", nameAr: "بنغلاديش", flag: "🇧🇩" },
  { code: "CN", name: "China", nameAr: "الصين", flag: "🇨🇳" },
  { code: "JP", name: "Japan", nameAr: "اليابان", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", nameAr: "كوريا الجنوبية", flag: "🇰🇷" },
  { code: "TH", name: "Thailand", nameAr: "تايلاند", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", nameAr: "فيتنام", flag: "🇻🇳" },
  { code: "MY", name: "Malaysia", nameAr: "ماليزيا", flag: "🇲🇾" },
  { code: "SG", name: "Singapore", nameAr: "سنغافورة", flag: "🇸🇬" },
  { code: "ID", name: "Indonesia", nameAr: "إندونيسيا", flag: "🇮🇩" },
  { code: "PH", name: "Philippines", nameAr: "الفلبين", flag: "🇵🇭" },
  { code: "BR", name: "Brazil", nameAr: "البرازيل", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", nameAr: "المكسيك", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", nameAr: "الأرجنتين", flag: "🇦🇷" },
  { code: "CL", name: "Chile", nameAr: "تشيلي", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", nameAr: "كولومبيا", flag: "🇨🇴" },
  { code: "PE", name: "Peru", nameAr: "بيرو", flag: "🇵🇪" },
  { code: "ZA", name: "South Africa", nameAr: "جنوب أفريقيا", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", nameAr: "نيجيريا", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", nameAr: "كينيا", flag: "🇰🇪" },
  { code: "ET", name: "Ethiopia", nameAr: "إثيوبيا", flag: "🇪🇹" },
  { code: "GH", name: "Ghana", nameAr: "غانا", flag: "🇬🇭" },
  { code: "TZ", name: "Tanzania", nameAr: "تنزانيا", flag: "🇹🇿" },
  { code: "UG", name: "Uganda", nameAr: "أوغندا", flag: "🇺🇬" },
  { code: "NZ", name: "New Zealand", nameAr: "نيوزيلندا", flag: "🇳🇿" },
  { code: "IE", name: "Ireland", nameAr: "أيرلندا", flag: "🇮🇪" },
  { code: "IL", name: "Israel", nameAr: "إسرائيل", flag: "🇮🇱" },
  { code: "IR", name: "Iran", nameAr: "إيران", flag: "🇮🇷" },
];

export function getCountryByCode(code: string): Country | undefined {
  return countries.find((c) => c.code === code);
}

export function getCountryName(code: string, locale: "ar" | "en" = "ar"): string {
  const country = getCountryByCode(code);
  if (!country) return code;
  return locale === "ar" ? country.nameAr : country.name;
}
