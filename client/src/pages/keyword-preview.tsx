import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Star, Clock } from "lucide-react";
import { getCountryByCode } from "@/lib/countries";

interface Keyword {
  id: string;
  keyword: string;
  domain: string;
  target_location: string;
  position: number | null;
}

interface SerperResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
  date?: string;
  rating?: number;
  reviews?: number;
}

export default function KeywordPreview() {
  const [, params] = useRoute("/keywords/:id/preview");
  const [, navigate] = useLocation();
  const keywordId = params?.id;

  const [serpResults, setSerpResults] = useState<SerperResult[]>([]);
  const [isLoadingSerp, setIsLoadingSerp] = useState(false);

  const { data: keyword, isLoading: keywordLoading } = useQuery<Keyword>({
    queryKey: ["/api/keywords", keywordId],
    enabled: !!keywordId,
    queryFn: async () => {
      const response = await fetch(`/api/keywords/${keywordId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch keyword");
      return response.json();
    },
  });

  const country = keyword ? getCountryByCode(keyword.target_location) : null;

  const handleCheckSerp = async () => {
    if (!keyword) return;

    setIsLoadingSerp(true);
    try {
      const response = await fetch(`/api/keywords/${keywordId}/serp`, {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to fetch SERP");
      
      const data = await response.json();
      setSerpResults(data.results || []);
    } catch (error) {
      console.error("Error fetching SERP:", error);
    } finally {
      setIsLoadingSerp(false);
    }
  };

  useEffect(() => {
    if (keyword && serpResults.length === 0) {
      handleCheckSerp();
    }
  }, [keyword]);

  if (keywordLoading || !keyword) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/keywords")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-primary">معاينة النتائج</h1>
              {country && (
                <Badge variant="outline" className="gap-2">
                  <span className="text-lg">{country.flag}</span>
                  {country.nameAr}
                </Badge>
              )}
            </div>
            <p className="text-lg font-semibold">{keyword.keyword}</p>
            <p className="text-sm text-muted-foreground">النطاق: {keyword.domain}</p>
          </div>
        </div>
        <Button
          onClick={handleCheckSerp}
          disabled={isLoadingSerp}
          data-testid="button-refresh-serp"
        >
          {isLoadingSerp ? "جاري التحميل..." : "تحديث النتائج"}
        </Button>
      </div>

      {/* Current Position */}
      {keyword.position && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              موقعك الحالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              #{keyword.position}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              في نتائج البحث
            </p>
          </CardContent>
        </Card>
      )}

      {/* SERP Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>نتائج جوجل ({serpResults.length})</span>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingSerp ? (
            <div className="space-y-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="space-y-2 pb-6 border-b last:border-0">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : serpResults.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>لا توجد نتائج متاحة. انقر على "تحديث النتائج" لجلب أحدث البيانات.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {serpResults.map((result, index) => {
                const isUserDomain = result.link.includes(keyword.domain);
                
                return (
                  <div
                    key={index}
                    className={`pb-6 border-b last:border-0 ${
                      isUserDomain ? "bg-primary/5 -mx-6 px-6 py-4 rounded-lg" : ""
                    }`}
                    data-testid={`serp-result-${index + 1}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isUserDomain ? "default" : "outline"}
                          className="font-mono"
                        >
                          #{result.position}
                        </Badge>
                        {isUserDomain && (
                          <Badge variant="default" className="gap-1">
                            <Star className="h-3 w-3" />
                            موقعك
                          </Badge>
                        )}
                      </div>
                      {result.rating && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{result.rating}</span>
                          {result.reviews && <span>({result.reviews})</span>}
                        </div>
                      )}
                    </div>

                    <h3 className={`text-lg font-semibold mb-1 ${isUserDomain ? "text-primary" : ""}`}>
                      {result.title}
                    </h3>

                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:underline flex items-center gap-1 mb-2"
                    >
                      {result.link}
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <p className="text-sm text-muted-foreground">{result.snippet}</p>

                    {result.date && (
                      <p className="text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3 inline ms-1" />
                        {result.date}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
