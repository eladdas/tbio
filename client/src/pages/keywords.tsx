import { useState, useMemo } from "react";
import { KeywordTable, KeywordData } from "@/components/keyword-table";
import { AddKeywordDialog } from "@/components/add-keyword-dialog";
import { AddBulkKeywordsDialog } from "@/components/add-bulk-keywords-dialog";
import { EditKeywordDialog } from "@/components/edit-keyword-dialog";
import { KeywordChartDialog } from "@/components/keyword-chart-dialog";
import { ExportReportDialog } from "@/components/export-report-dialog";
import { EmptyState } from "@/components/empty-state";
import { TrendingUp, Target, CheckCircle2, TrendingDown, RefreshCw, Filter, Search, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useLocation } from "wouter";

interface EnrichedKeyword {
  id: string;
  keyword: string;
  domain: string;
  domain_id: string;
  target_location: string;
  device_type: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  position: number | null;
  previousPosition: number | null;
  searchVolume: number;
  lastChecked: string | null;
}

export default function Keywords() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<EnrichedKeyword | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: keywords = [], isLoading: keywordsLoading } = useQuery<EnrichedKeyword[]>({
    queryKey: ['/api/keywords'],
  });

  const addKeywordMutation = useMutation({
    mutationFn: async ({ keyword, domain_id, target_location, device_type, tags }: { keyword: string; domain_id: string; target_location: string; device_type: string; tags?: string[] }) => {
      const res = await apiRequest('POST', '/api/keywords', { keyword, domain_id, target_location, device_type, tags });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keywords'] });
      toast({
        title: "تم بنجاح",
        description: "تمت إضافة الكلمة المفتاحية بنجاح",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "فشل في إضافة الكلمة المفتاحية";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const addBulkKeywordsMutation = useMutation({
    mutationFn: async ({ keywords, domain_id, target_location, device_type }: { keywords: string[]; domain_id: string; target_location: string; device_type: string }) => {
      const response = await fetch('/api/keywords/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ keywords, domain_id, target_location, device_type }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add keywords');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/keywords'] });
      toast({
        title: "تم بنجاح",
        description: data.message || `تمت إضافة ${data.count} كلمة مفتاحية`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "فشل في إضافة الكلمات المفتاحية";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const updateKeywordMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { keyword: string; target_location: string; device_type: string; is_active: boolean; tags?: string[] } }) => {
      const res = await apiRequest('PATCH', `/api/keywords/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keywords'] });
      setEditDialogOpen(false);
      setSelectedKeyword(null);
      toast({
        title: "تم بنجاح",
        description: "تم تعديل الكلمة المفتاحية بنجاح",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "فشل في تعديل الكلمة المفتاحية";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const deleteKeywordMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/keywords/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keywords'] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف الكلمة المفتاحية بنجاح",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "فشل في حذف الكلمة المفتاحية";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const checkRankingMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/keywords/${id}/check-ranking`);
      return await res.json();
    },
    onSuccess: (data: any) => {
      // Optimistic update
      queryClient.setQueryData(['/api/keywords'], (oldData: EnrichedKeyword[] | undefined) => {
        if (!oldData) return oldData;

        return oldData.map(kw => {
          if (kw.id === data.keyword_id) {
            return {
              ...kw,
              position: data.position,
              // Only update previous position if we have a valid new position and it's different
              previousPosition: data.position ? (kw.position || kw.previousPosition) : kw.previousPosition,
              searchVolume: data.search_volume || kw.searchVolume,
              lastChecked: new Date().toISOString()
            };
          }
          return kw;
        });
      });

      // Still invalidate to ensure consistency eventually, but UI updates immediately
      // queryClient.invalidateQueries({ queryKey: ['/api/keywords'] }); 

      if (data.found) {
        toast({
          title: "تم الفحص بنجاح",
          description: `تم العثور على الموقع في المرتبة ${data.position}`,
        });
      } else {
        toast({
          title: "تم الفحص",
          description: "لم يتم العثور على الموقع في النتائج الـ 100 الأولى",
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || "فشل في فحص الترتيب";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const refreshAllMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/keywords/refresh-all');
      return await res.json();
    },
    onSuccess: async (data: any) => {
      // Note: refreshAll returns batch results, we invalidate to get fresh data
      // since we don't have individual keyword updates in the response
      await queryClient.invalidateQueries({ queryKey: ['/api/keywords'] });
      await queryClient.refetchQueries({ queryKey: ['/api/keywords'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "تم التحديث بنجاح",
        description: `تم فحص ${data.checked} من ${data.total} كلمة مفتاحية`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "فشل في تحديث الكلمات";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleAddKeyword = (keyword: string, domainId: string, targetLocation: string, deviceType: string, tags?: string[]) => {
    addKeywordMutation.mutate({ keyword, domain_id: domainId, target_location: targetLocation, device_type: deviceType, tags });
  };

  const handleAddBulkKeywords = (keywords: string[], domainId: string, targetLocation: string, deviceType: string) => {
    addBulkKeywordsMutation.mutate({ keywords, domain_id: domainId, target_location: targetLocation, device_type: deviceType });
  };

  const handleEditKeyword = (id: string) => {
    const keyword = keywords.find((k) => k.id === id);
    if (keyword) {
      setSelectedKeyword(keyword);
      setEditDialogOpen(true);
    }
  };

  const handleSubmitEdit = (data: { keyword: string; target_location: string; device_type: string; is_active: boolean; tags?: string[] }) => {
    if (selectedKeyword) {
      updateKeywordMutation.mutate({ id: selectedKeyword.id, data });
    }
  };

  const handleViewChart = (id: string) => {
    const keyword = keywords.find((k) => k.id === id);
    if (keyword) {
      setSelectedKeyword(keyword);
      setChartDialogOpen(true);
    }
  };

  const handlePreview = (id: string) => {
    navigate(`/keywords/${id}/preview`);
  };

  const handleDeleteKeyword = (id: string) => {
    deleteKeywordMutation.mutate(id);
  };

  const handleCheckRanking = (id: string) => {
    checkRankingMutation.mutate(id);
  };

  const handleRefreshAll = () => {
    refreshAllMutation.mutate();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedDomain("all");
    setSelectedCountry("all");
    setSelectedTag("all");
  };

  // Get unique values for filters
  const uniqueDomains = useMemo(() => {
    const domains = new Set(keywords.map(k => k.domain));
    return Array.from(domains).sort();
  }, [keywords]);

  const uniqueCountries = useMemo(() => {
    const countries = new Set(keywords.map(k => k.target_location));
    return Array.from(countries).sort();
  }, [keywords]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    keywords.forEach(k => {
      if (k.tags) {
        k.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [keywords]);

  // Apply filters
  const filteredKeywords = useMemo(() => {
    return keywords.filter(kw => {
      // Search filter
      if (searchQuery && !kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Domain filter
      if (selectedDomain !== "all" && kw.domain !== selectedDomain) {
        return false;
      }

      // Country filter
      if (selectedCountry !== "all" && kw.target_location !== selectedCountry) {
        return false;
      }

      // Tag filter
      if (selectedTag !== "all") {
        if (!kw.tags || !kw.tags.includes(selectedTag)) {
          return false;
        }
      }

      return true;
    });
  }, [keywords, searchQuery, selectedDomain, selectedCountry, selectedTag]);

  // Convert to KeywordData format for the table
  const tableData: KeywordData[] = filteredKeywords.map((kw) => ({
    id: kw.id,
    keyword: kw.keyword,
    domain: kw.domain,
    device_type: kw.device_type || "desktop",
    position: kw.position || 0,
    previousPosition: kw.previousPosition || kw.position || 0,
    searchVolume: kw.searchVolume,
    lastChecked: kw.lastChecked
      ? formatDistanceToNow(new Date(kw.lastChecked), { addSuffix: true, locale: ar })
      : "لم يتم الفحص بعد",
  }));

  const topKeywords = tableData.filter(k => k.position > 0 && k.position <= 10);
  const improvingKeywords = tableData.filter(k => k.previousPosition > k.position && k.position > 0);
  const activeKeywords = filteredKeywords.filter(k => k.is_active);

  const averagePosition = tableData.filter(k => k.position > 0).length > 0
    ? Math.round(tableData.filter(k => k.position > 0).reduce((sum, k) => sum + k.position, 0) / tableData.filter(k => k.position > 0).length)
    : 0;

  const hasActiveFilters = searchQuery || selectedDomain !== "all" || selectedCountry !== "all" || selectedTag !== "all";

  if (keywordsLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-3">
              إدارة الكلمات
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">الكلمات المفتاحية</h1>
            <p className="text-sm md:text-base text-muted-foreground">إدارة وتتبع جميع كلماتك المفتاحية عبر النطاقات</p>
          </div>
          <Skeleton className="h-10 w-48" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card data-testid="card-total-keywords">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الكلمات</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
          <Card data-testid="card-active-keywords">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الكلمات النشطة</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
          <Card data-testid="card-average-position">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط الترتيب</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        </div>

        {/* Table Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-3">
            إدارة الكلمات
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">الكلمات المفتاحية</h1>
          <p className="text-sm md:text-base text-muted-foreground">إدارة وتتبع جميع كلماتك المفتاحية عبر النطاقات</p>
        </div>
        <div className="flex gap-2">
          <AddKeywordDialog
            onAdd={handleAddKeyword}
            isPending={addKeywordMutation.isPending}
          />
          <AddBulkKeywordsDialog
            onAdd={handleAddBulkKeywords}
            isPending={addBulkKeywordsMutation.isPending}
          />
          <Button
            onClick={handleRefreshAll}
            disabled={refreshAllMutation.isPending || keywords.length === 0}
            variant="outline"
            data-testid="button-refresh-all"
          >
            <RefreshCw className={`h-4 w-4 ms-2 ${refreshAllMutation.isPending ? 'animate-spin' : ''}`} />
            تحديث الآن
          </Button>
          <ExportReportDialog selectedKeywordIds={[]} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="card-total-keywords">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الكلمات</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-keywords">{keywords.length}</div>
            <p className="text-xs text-muted-foreground">الكلمات المتتبعة</p>
          </CardContent>
        </Card>
        <Card data-testid="card-active-keywords">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الكلمات النشطة</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-keywords">{activeKeywords.length}</div>
            <p className="text-xs text-muted-foreground">كلمات نشطة</p>
          </CardContent>
        </Card>
        <Card data-testid="card-average-position">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الترتيب</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-average-position">
              {averagePosition > 0 ? `#${averagePosition}` : "-"}
            </div>
            <p className="text-xs text-muted-foreground">للكلمات المرتبة</p>
          </CardContent>
        </Card>
      </div>

      {
        keywords.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="لا توجد كلمات مفتاحية بعد"
            description="ابدأ في تتبع أداء SEO الخاص بك عن طريق إضافة كلمتك المفتاحية الأولى. سنقوم تلقائياً بفحص الترتيب يومياً."
            action={{
              label: "إضافة كلمتك المفتاحية الأولى",
              onClick: () => { }
            }}
          />
        ) : (
          <>
            {/* Filters Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">فلترة الكلمات المفتاحية</CardTitle>
                    {hasActiveFilters && (
                      <Badge variant="secondary" data-testid="badge-active-filters">
                        {[searchQuery && "بحث", selectedDomain !== "all" && "نطاق", selectedCountry !== "all" && "دولة", selectedTag !== "all" && "وسم"].filter(Boolean).length} فلاتر نشطة
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        data-testid="button-clear-filters"
                      >
                        <X className="h-4 w-4 ms-1" />
                        مسح الفلاتر
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      data-testid="button-toggle-filters"
                    >
                      {showFilters ? "إخفاء" : "إظهار"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {showFilters && (
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Search */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">بحث بالكلمة</label>
                      <div className="relative">
                        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="ابحث عن كلمة..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pr-9"
                          data-testid="input-search"
                        />
                      </div>
                    </div>

                    {/* Domain Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">النطاق</label>
                      <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                        <SelectTrigger data-testid="select-domain">
                          <SelectValue placeholder="جميع النطاقات" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع النطاقات</SelectItem>
                          {uniqueDomains.map(domain => (
                            <SelectItem key={domain} value={domain}>
                              {domain}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Country Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الدولة</label>
                      <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger data-testid="select-country">
                          <SelectValue placeholder="جميع الدول" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الدول</SelectItem>
                          {uniqueCountries.map(country => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tag Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الوسم</label>
                      <Select value={selectedTag} onValueChange={setSelectedTag}>
                        <SelectTrigger data-testid="select-tag">
                          <SelectValue placeholder="جميع الوسوم" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الوسوم</SelectItem>
                          {uniqueTags.length === 0 ? (
                            <SelectItem value="none" disabled>لا توجد وسوم</SelectItem>
                          ) : (
                            uniqueTags.map(tag => (
                              <SelectItem key={tag} value={tag}>
                                {tag}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>




            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="w-full sm:w-auto flex-wrap h-auto">
                <TabsTrigger value="all" data-testid="tab-all" className="text-xs sm:text-sm">جميع الكلمات ({tableData.length})</TabsTrigger>
                <TabsTrigger value="top" data-testid="tab-top" className="text-xs sm:text-sm">أفضل 10 ({topKeywords.length})</TabsTrigger>
                <TabsTrigger value="improving" data-testid="tab-improving" className="text-xs sm:text-sm">متحسنة ({improvingKeywords.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <KeywordTable
                  data={tableData}
                  onEdit={handleEditKeyword}
                  onDelete={handleDeleteKeyword}
                  onCheckRanking={handleCheckRanking}
                  onViewChart={handleViewChart}
                  onPreview={handlePreview}
                  isCheckingRanking={checkRankingMutation.isPending}
                />
              </TabsContent>
              <TabsContent value="top" className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <KeywordTable
                  data={topKeywords}
                  onEdit={handleEditKeyword}
                  onDelete={handleDeleteKeyword}
                  onCheckRanking={handleCheckRanking}
                  onViewChart={handleViewChart}
                  onPreview={handlePreview}
                  isCheckingRanking={checkRankingMutation.isPending}
                />
              </TabsContent>
              <TabsContent value="improving" className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <KeywordTable
                  data={improvingKeywords}
                  onEdit={handleEditKeyword}
                  onDelete={handleDeleteKeyword}
                  onCheckRanking={handleCheckRanking}
                  onViewChart={handleViewChart}
                  onPreview={handlePreview}
                  isCheckingRanking={checkRankingMutation.isPending}
                />
              </TabsContent>
            </Tabs>

            {/* Edit Keyword Dialog */}
            {
              selectedKeyword && (
                <EditKeywordDialog
                  open={editDialogOpen}
                  onOpenChange={setEditDialogOpen}
                  keyword={{
                    id: selectedKeyword.id,
                    keyword: selectedKeyword.keyword,
                    target_location: selectedKeyword.target_location,
                    device_type: selectedKeyword.device_type,
                    is_active: selectedKeyword.is_active,
                    tags: selectedKeyword.tags,
                  }}
                  onSubmit={handleSubmitEdit}
                  isPending={updateKeywordMutation.isPending}
                />
              )
            }

            {/* Keyword Chart Dialog */}
            {
              selectedKeyword && (
                <KeywordChartDialog
                  open={chartDialogOpen}
                  onOpenChange={setChartDialogOpen}
                  keywordId={selectedKeyword.id}
                  keywordText={selectedKeyword.keyword}
                />
              )
            }
          </>
        )
      }
    </div>
  );
}
