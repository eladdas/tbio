import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Sparkles, TrendingUp, MessageSquare, Users, Target, FileText, Download, Trash2, Link2, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { KeywordResearch } from "@shared/schema";

interface KeywordResult {
  keyword: string;
  searchIntent: string;
  difficulty: string;
  estimatedVolume: string;
  kgr?: number;
  competitorCount?: number;
  reasoning: string;
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

const strategies = [
  { value: "kgr", label: "KGR Keywords", icon: Target, description: "كلمات ذهبية بمنافسة منخفضة" },
  { value: "longtail", label: "Longtail Keywords", icon: TrendingUp, description: "كلمات طويلة ومحددة" },
  { value: "question_based", label: "Question-Based", icon: MessageSquare, description: "أسئلة المستخدمين" },
  { value: "competitor_analysis", label: "Competitor Analysis", icon: Users, description: "تحليل المنافسين" },
  { value: "semantic", label: "Semantic Keywords", icon: Sparkles, description: "كلمات دلالية مرتبطة" },
];

const countries = [
  { value: "SA", label: "السعودية" },
  { value: "EG", label: "مصر" },
  { value: "AE", label: "الإمارات" },
  { value: "KW", label: "الكويت" },
  { value: "QA", label: "قطر" },
  { value: "BH", label: "البحرين" },
  { value: "OM", label: "عمان" },
  { value: "JO", label: "الأردن" },
  { value: "LB", label: "لبنان" },
  { value: "IQ", label: "العراق" },
];

const difficultyColors: Record<string, string> = {
  "سهل": "bg-green-500/10 text-green-500 border-green-500/20",
  "متوسط": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "صعب": "bg-red-500/10 text-red-500 border-red-500/20",
};

const volumeColors: Record<string, string> = {
  "منخفض": "bg-gray-500/10 text-gray-500 border-gray-500/20",
  "متوسط": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "عالي": "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export default function KeywordResearchPage() {
  const { toast } = useToast();
  const [seedKeywords, setSeedKeywords] = useState("");
  const [targetLocation, setTargetLocation] = useState("SA");
  const [strategy, setStrategy] = useState("longtail");
  const [selectedResearch, setSelectedResearch] = useState<KeywordResearch | null>(null);

  const [lsiMainKeyword, setLsiMainKeyword] = useState("");
  const [lsiLocation, setLsiLocation] = useState("SA");
  const [lsiContentType, setLsiContentType] = useState("مقال شامل");
  const [lsiCluster, setLsiCluster] = useState<LSICluster | null>(null);

  const { data: researchHistory = [], isLoading: isLoadingHistory } = useQuery<KeywordResearch[]>({
    queryKey: ["/api/keyword-research"],
  });

  const createResearchMutation = useMutation({
    mutationFn: async (data: { seedKeywords: string[]; targetLocation: string; strategy: string }) => {
      const res = await apiRequest("POST", "/api/keyword-research", data);
      return await res.json();
    },
    onSuccess: (data: KeywordResearch) => {
      queryClient.invalidateQueries({ queryKey: ["/api/keyword-research"] });
      setSelectedResearch(data);
      const resultsData = data.results as { keywords: KeywordResult[]; summary: string };
      toast({
        title: "تم إنشاء البحث بنجاح",
        description: `تم توليد ${resultsData.keywords.length} كلمة مفتاحية`,
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء البحث. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const deleteResearchMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/keyword-research/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keyword-research"] });
      if (selectedResearch) {
        setSelectedResearch(null);
      }
      toast({
        title: "تم الحذف",
        description: "تم حذف البحث بنجاح",
      });
    },
  });

  const generateLSIClusterMutation = useMutation({
    mutationFn: async (data: { mainKeyword: string; targetLocation: string; contentType: string }) => {
      const res = await apiRequest("POST", "/api/keyword-research/lsi-cluster", data);
      return await res.json();
    },
    onSuccess: (data: LSICluster) => {
      setLsiCluster(data);
      toast({
        title: "تم إنشاء مجموعة LSI بنجاح",
        description: `تم توليد ${data.lsiKeywords.length} كلمة مفتاحية LSI`,
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء مجموعة LSI. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    const keywords = seedKeywords.split(",").map(k => k.trim()).filter(k => k);

    if (keywords.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كلمات مفتاحية أساسية",
        variant: "destructive",
      });
      return;
    }

    createResearchMutation.mutate({
      seedKeywords: keywords,
      targetLocation,
      strategy,
    });
  };

  const handleExportCSV = (keywords: KeywordResult[]) => {
    const headers = ["الكلمة المفتاحية", "نية البحث", "الصعوبة", "حجم البحث المقدر", "السبب"];
    const rows = keywords.map(k => [
      k.keyword,
      k.searchIntent,
      k.difficulty,
      k.estimatedVolume,
      k.reasoning,
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `keywords-${Date.now()}.csv`;
    link.click();
  };

  const handleGenerateLSI = () => {
    if (!lsiMainKeyword.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الكلمة المفتاحية الرئيسية",
        variant: "destructive",
      });
      return;
    }

    generateLSIClusterMutation.mutate({
      mainKeyword: lsiMainKeyword,
      targetLocation: lsiLocation,
      contentType: lsiContentType,
    });
  };

  const handleExportLSI = () => {
    if (!lsiCluster) return;

    const headers = ["الكلمة المفتاحية", "مدى الصلة", "كيفية الاستخدام"];
    const rows = lsiCluster.lsiKeywords.map(k => [
      k.keyword,
      k.relevance,
      k.usage,
    ]);

    const csv = [
      [`الكلمة الرئيسية:,${lsiCluster.mainKeyword}`],
      [""],
      headers,
      ...rows,
      [""],
      [`استراتيجية المحتوى:,"${lsiCluster.contentStrategy}"`],
      [""],
      ["المواضيع المشمولة:"],
      ...lsiCluster.topicCoverage.map(topic => [`,"${topic}"`]),
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `lsi-cluster-${lsiCluster.mainKeyword}-${Date.now()}.csv`;
    link.click();
  };

  const selectedStrategy = strategies.find(s => s.value === strategy);
  const StrategyIcon = selectedStrategy?.icon || Sparkles;

  const resultsData = selectedResearch?.results as { keywords: KeywordResult[]; summary: string } | undefined;
  const results: KeywordResult[] = resultsData?.keywords || [];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">أداة البحث عن الكلمات المفتاحية</h1>
        <p className="text-muted-foreground">
          استخدم الذكاء الاصطناعي للعثور على أفضل الكلمات المفتاحية لموقعك
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              إعدادات البحث
            </CardTitle>
            <CardDescription>
              أدخل الكلمات الأساسية واختر الاستراتيجية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="seed-keywords" data-testid="label-seed-keywords">
                الكلمات المفتاحية الأساسية
              </Label>
              <Input
                id="seed-keywords"
                data-testid="input-seed-keywords"
                placeholder="مثال: تطوير تطبيقات, برمجة مواقع"
                value={seedKeywords}
                onChange={(e) => setSeedKeywords(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                افصل بينها بفاصلة (,)
              </p>
            </div>

            <div>
              <Label htmlFor="target-location" data-testid="label-target-location">
                الدولة المستهدفة
              </Label>
              <Select value={targetLocation} onValueChange={setTargetLocation}>
                <SelectTrigger id="target-location" data-testid="select-target-location" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="strategy" data-testid="label-strategy">
                الاستراتيجية
              </Label>
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger id="strategy" data-testid="select-strategy" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map((s) => {
                    const Icon = s.icon;
                    return (
                      <SelectItem key={s.value} value={s.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{s.label}</div>
                            <div className="text-xs text-muted-foreground">{s.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Button
              data-testid="button-generate-keywords"
              onClick={handleGenerate}
              disabled={createResearchMutation.isPending}
              className="w-full"
            >
              {createResearchMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري التوليد...
                </>
              ) : (
                <>
                  <StrategyIcon className="w-4 h-4 ml-2" />
                  توليد الكلمات المفتاحية
                </>
              )}
            </Button>

            {selectedResearch && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">النتائج الحالية</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">عدد الكلمات:</span>
                    <span className="font-medium">{results.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الاستراتيجية:</span>
                    <span className="font-medium">
                      {strategies.find(s => s.value === selectedResearch.strategy)?.label}
                    </span>
                  </div>
                  <Button
                    data-testid="button-export-csv"
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCSV(results)}
                    className="w-full mt-2"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    تصدير CSV
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <Tabs defaultValue="results" className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle>النتائج</CardTitle>
                  <CardDescription>
                    {results.length > 0 ? `${results.length} كلمة مفتاحية` : "لا توجد نتائج"}
                  </CardDescription>
                </div>
                <TabsList>
                  <TabsTrigger value="results" data-testid="tab-results">
                    <FileText className="w-4 h-4 ml-1.5" />
                    النتائج
                  </TabsTrigger>
                  <TabsTrigger value="lsi-cluster" data-testid="tab-lsi-cluster">
                    <Link2 className="w-4 h-4 ml-1.5" />
                    LSI Cluster
                  </TabsTrigger>
                  <TabsTrigger value="history" data-testid="tab-history">
                    السجل
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent>
              <TabsContent value="results" className="mt-0">
                {createResearchMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">جاري توليد الكلمات المفتاحية...</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                    <Sparkles className="w-12 h-12 text-muted-foreground/50" />
                    <div>
                      <p className="font-medium mb-1">ابدأ البحث عن الكلمات المفتاحية</p>
                      <p className="text-sm text-muted-foreground">
                        أدخل الكلمات الأساسية واختر الاستراتيجية ثم اضغط "توليد"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resultsData?.summary && (
                      <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                          <CardTitle className="text-base">ملخص النتائج</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed">{resultsData.summary}</p>
                        </CardContent>
                      </Card>
                    )}

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">الكلمة المفتاحية</TableHead>
                            <TableHead className="text-right">نية البحث</TableHead>
                            <TableHead className="text-right">الصعوبة</TableHead>
                            <TableHead className="text-right">حجم البحث</TableHead>
                            <TableHead className="text-right">السبب</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.map((keyword, idx) => (
                            <TableRow key={idx} data-testid={`row-keyword-${idx}`}>
                              <TableCell className="font-medium">{keyword.keyword}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{keyword.searchIntent}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={difficultyColors[keyword.difficulty] || ""}
                                >
                                  {keyword.difficulty}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={volumeColors[keyword.estimatedVolume] || ""}
                                >
                                  {keyword.estimatedVolume}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground max-w-md">
                                {keyword.reasoning}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : researchHistory.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    لا يوجد سجل بحث سابق
                  </div>
                ) : (
                  <div className="space-y-3">
                    {researchHistory.map((research) => (
                      <Card
                        key={research.id}
                        className={`cursor-pointer hover-elevate ${selectedResearch?.id === research.id ? "border-primary" : ""
                          }`}
                        onClick={() => setSelectedResearch(research)}
                        data-testid={`card-research-${research.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge variant="outline">
                                  {strategies.find(s => s.value === research.strategy)?.label}
                                </Badge>
                                <Badge variant="secondary">
                                  {research.target_location}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(research.created_at).toLocaleDateString("ar-SA")}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>
                                  <span className="font-medium">الكلمات الأساسية:</span>{" "}
                                  {(research.seed_keywords as string[]).join(", ")}
                                </div>
                                <div>
                                  <span className="font-medium">النتائج:</span>{" "}
                                  {(research.results as { keywords: KeywordResult[] })?.keywords?.length || 0} كلمة مفتاحية
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-delete-${research.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteResearchMutation.mutate(research.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lsi-cluster" className="mt-0">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">إنشاء مجموعة LSI Keywords</CardTitle>
                      <CardDescription>
                        أدخل كلمة مفتاحية رئيسية واحدة للحصول على كلمات LSI مرتبطة
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                          <Label htmlFor="lsi-main-keyword">الكلمة الرئيسية</Label>
                          <Input
                            id="lsi-main-keyword"
                            data-testid="input-lsi-main-keyword"
                            placeholder="مثال: تطوير تطبيقات الجوال"
                            value={lsiMainKeyword}
                            onChange={(e) => setLsiMainKeyword(e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <Label htmlFor="lsi-location">الدولة المستهدفة</Label>
                          <Select value={lsiLocation} onValueChange={setLsiLocation}>
                            <SelectTrigger id="lsi-location" data-testid="select-lsi-location" className="mt-1.5">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country.value} value={country.value}>
                                  {country.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-1">
                          <Label htmlFor="lsi-content-type">نوع المحتوى</Label>
                          <Select value={lsiContentType} onValueChange={setLsiContentType}>
                            <SelectTrigger id="lsi-content-type" data-testid="select-lsi-content-type" className="mt-1.5">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="مقال شامل">مقال شامل</SelectItem>
                              <SelectItem value="صفحة منتج">صفحة منتج</SelectItem>
                              <SelectItem value="صفحة خدمة">صفحة خدمة</SelectItem>
                              <SelectItem value="مدونة">مدونة</SelectItem>
                              <SelectItem value="دليل إرشادي">دليل إرشادي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        data-testid="button-generate-lsi"
                        onClick={handleGenerateLSI}
                        disabled={generateLSIClusterMutation.isPending}
                        className="w-full md:w-auto"
                      >
                        {generateLSIClusterMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            جاري التوليد...
                          </>
                        ) : (
                          <>
                            <Layers className="w-4 h-4 ml-2" />
                            إنشاء مجموعة LSI
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {generateLSIClusterMutation.isPending ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">جاري توليد مجموعة LSI...</p>
                    </div>
                  ) : lsiCluster ? (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary" />
                                الكلمة الرئيسية: {lsiCluster.mainKeyword}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {lsiCluster.lsiKeywords.length} كلمة مفتاحية LSI
                              </CardDescription>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleExportLSI}
                              data-testid="button-export-lsi"
                            >
                              <Download className="w-4 h-4 ml-2" />
                              تصدير CSV
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">استراتيجية المحتوى</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed whitespace-pre-line">{lsiCluster.contentStrategy}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">المواضيع المشمولة</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {lsiCluster.topicCoverage.map((topic, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <span className="text-sm">{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">كلمات LSI ({lsiCluster.lsiKeywords.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-right">الكلمة المفتاحية</TableHead>
                                  <TableHead className="text-right">مدى الصلة</TableHead>
                                  <TableHead className="text-right">كيفية الاستخدام</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {lsiCluster.lsiKeywords.map((lsi, idx) => (
                                  <TableRow key={idx} data-testid={`row-lsi-${idx}`}>
                                    <TableCell className="font-medium">{lsi.keyword}</TableCell>
                                    <TableCell>
                                      <Badge
                                        variant="outline"
                                        className={
                                          lsi.relevance === "عالية"
                                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                                            : lsi.relevance === "متوسطة"
                                              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                              : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                                        }
                                      >
                                        {lsi.relevance}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {lsi.usage}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                      <Link2 className="w-12 h-12 text-muted-foreground/50" />
                      <div>
                        <p className="font-medium mb-1">ابدأ بإنشاء مجموعة LSI</p>
                        <p className="text-sm text-muted-foreground">
                          أدخل الكلمة الرئيسية واضغط "إنشاء مجموعة LSI"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
