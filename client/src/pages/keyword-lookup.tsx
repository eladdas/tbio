import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, TrendingUp, TrendingDown, Monitor, Smartphone, Globe } from "lucide-react";

interface LookupResult {
  keyword: string;
  domain: string;
  location: string;
  device: string;
  position: number | null;
  found: boolean;
  matchedUrl: string | null;
  searchVolume: number | null;
  totalResults: number;
}

const COUNTRIES = [
  { value: "sa", label: "السعودية" },
  { value: "ae", label: "الإمارات" },
  { value: "eg", label: "مصر" },
  { value: "kw", label: "الكويت" },
  { value: "qa", label: "قطر" },
  { value: "bh", label: "البحرين" },
  { value: "om", label: "عمان" },
  { value: "jo", label: "الأردن" },
  { value: "lb", label: "لبنان" },
  { value: "iq", label: "العراق" },
  { value: "sy", label: "سوريا" },
  { value: "ye", label: "اليمن" },
  { value: "ma", label: "المغرب" },
  { value: "dz", label: "الجزائر" },
  { value: "tn", label: "تونس" },
  { value: "ly", label: "ليبيا" },
  { value: "sd", label: "السودان" },
];

export default function KeywordLookup() {
  const [keyword, setKeyword] = useState("");
  const [domain, setDomain] = useState("");
  const [location, setLocation] = useState("sa");
  const [device, setDevice] = useState("desktop");
  const [result, setResult] = useState<LookupResult | null>(null);

  const lookupMutation = useMutation({
    mutationFn: async (data: { keyword: string; domain: string; location: string; device: string }) => {
      const response = await apiRequest('POST', '/api/keyword-lookup', data);
      return await response.json() as LookupResult;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim() && domain.trim()) {
      setResult(null); // Clear previous result before new search
      lookupMutation.mutate({ keyword, domain, location, device });
    }
  };

  const handleReset = () => {
    setKeyword("");
    setDomain("");
    setLocation("sa");
    setDevice("desktop");
    setResult(null);
    lookupMutation.reset();
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "El Messiri" }}>
            البحث الفوري عن ترتيب الكلمة المفتاحية
          </h1>
          <p className="text-muted-foreground mt-2">
            تحقق من ترتيب أي كلمة مفتاحية بشكل فوري دون الحاجة لإضافتها لقائمة المتابعة
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              نموذج البحث
            </CardTitle>
            <CardDescription>
              أدخل الكلمة المفتاحية والنطاق للبحث عن الترتيب
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="keyword">الكلمة المفتاحية *</Label>
                  <Input
                    id="keyword"
                    data-testid="input-lookup-keyword"
                    placeholder="مثال: أفضل مطعم في الرياض"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">النطاق *</Label>
                  <Input
                    id="domain"
                    data-testid="input-lookup-domain"
                    placeholder="مثال: example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">الدولة</Label>
                  <Select
                    value={location}
                    onValueChange={setLocation}
                  >
                    <SelectTrigger id="location" data-testid="select-lookup-location">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="device">نوع الجهاز</Label>
                  <Select
                    value={device}
                    onValueChange={setDevice}
                  >
                    <SelectTrigger id="device" data-testid="select-lookup-device">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desktop">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          <span>سطح المكتب</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="mobile">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          <span>الهاتف المحمول</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  data-testid="button-lookup-search"
                  disabled={lookupMutation.isPending || !keyword.trim() || !domain.trim()}
                >
                  {lookupMutation.isPending ? (
                    <>
                      <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                      جاري البحث...
                    </>
                  ) : (
                    <>
                      <Search className="ms-2 h-4 w-4" />
                      بحث
                    </>
                  )}
                </Button>

                {result && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    data-testid="button-lookup-reset"
                  >
                    بحث جديد
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {lookupMutation.isError && (
          <Alert variant="destructive">
            <AlertTitle>خطأ</AlertTitle>
            <AlertDescription>
              {(lookupMutation.error as any)?.message || "حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى."}
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.found ? (
                  <TrendingUp className="h-5 w-5 text-primary" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-muted-foreground" />
                )}
                نتيجة البحث
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">الكلمة المفتاحية</Label>
                  <div className="font-medium" data-testid="text-result-keyword">
                    {result.keyword}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">النطاق</Label>
                  <div className="font-medium" data-testid="text-result-domain">
                    {result.domain}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">الدولة</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium" data-testid="text-result-location">
                      {COUNTRIES.find(c => c.value === result.location)?.label || result.location.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">نوع الجهاز</Label>
                  <div className="flex items-center gap-2">
                    {result.device === 'mobile' ? (
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium" data-testid="text-result-device">
                      {result.device === 'mobile' ? 'الهاتف المحمول' : 'سطح المكتب'}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">الترتيب</Label>
                  {result.found && result.position !== null ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-lg px-4 py-2" data-testid="badge-result-position">
                        #{result.position}
                      </Badge>
                    </div>
                  ) : (
                    <Badge variant="secondary" data-testid="badge-result-not-found">
                      غير موجود في أول 100 نتيجة
                    </Badge>
                  )}
                </div>

                {result.matchedUrl && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">الرابط المطابق</Label>
                    <a
                      href={result.matchedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline block truncate"
                      data-testid="link-result-url"
                    >
                      {result.matchedUrl}
                    </a>
                  </div>
                )}

                {result.searchVolume !== null && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">إجمالي النتائج</Label>
                    <div className="font-medium" data-testid="text-result-volume">
                      {result.searchVolume.toLocaleString('ar-SA')}
                    </div>
                  </div>
                )}
              </div>

              <Alert>
                <AlertDescription className="text-sm text-muted-foreground">
                  ملاحظة: هذا البحث فوري ولا يتم حفظ النتائج في قاعدة البيانات. لمتابعة الكلمة المفتاحية بشكل دائم، يرجى إضافتها من صفحة الكلمات المفتاحية.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
