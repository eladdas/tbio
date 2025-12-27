import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Plan, Subscription } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { PaymobCheckout } from "@/components/paymob-checkout";
import { useState, useEffect } from "react";

type SubscriptionResponse = Subscription & {
  plan: Plan;
  usage: {
    domains: number;
    keywords: number;
  };
};

export default function Subscription() {
  const { toast } = useToast();
  const [paymobOpen, setPaymobOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');

    if (paymentStatus === 'success') {
      toast({
        title: "تم الدفع بنجاح",
        description: "تم تفعيل اشتراكك بنجاح",
      });
      window.history.replaceState({}, '', '/subscription');
    } else if (paymentStatus === 'failed') {
      toast({
        variant: "destructive",
        title: "فشل الدفع",
        description: "حدث خطأ أثناء عملية الدفع. يرجى المحاولة مرة أخرى.",
      });
      window.history.replaceState({}, '', '/subscription');
    }
  }, [toast]);

  const { data: subscriptionData, isLoading: isLoadingSubscription, error: subscriptionError } = useQuery<SubscriptionResponse>({
    queryKey: ['/api/subscription'],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: plans, isLoading: isLoadingPlans, error: plansError } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  if (subscriptionError) {
    toast({
      title: "خطأ",
      description: "فشل تحميل بيانات الاشتراك",
      variant: "destructive",
    });
  }

  if (plansError) {
    toast({
      title: "خطأ",
      description: "فشل تحميل الباقات المتاحة",
      variant: "destructive",
    });
  }

  const handlePayWithPaymob = (plan: Plan) => {
    setSelectedPlan(plan);
    setPaymobOpen(true);
  };

  const getFeaturesList = (plan: Plan): string[] => {
    const features: string[] = [];

    if (plan.keywords_limit > 0) {
      features.push(`${plan.keywords_limit} كلمة مفتاحية`);
    }

    if (plan.domains_limit > 0) {
      features.push(`${plan.domains_limit === 999999 ? 'غير محدودة' : plan.domains_limit} نطاقات`);
    }

    const updateFrequency = plan.update_frequency_hours;
    if (updateFrequency === 1) {
      features.push("تحديثات كل ساعة");
    } else if (updateFrequency === 6) {
      features.push("تحديثات كل 6 ساعات");
    } else if (updateFrequency === 24) {
      features.push("تحديثات يومية");
    }

    return features;
  };

  const getPlanIcon = (planName: string) => {
    const nameLower = planName.toLowerCase();
    if (nameLower.includes('basic') || nameLower.includes('أساسي')) return Zap;
    if (nameLower.includes('professional') || nameLower.includes('محترف')) return Crown;
    if (nameLower.includes('enterprise') || nameLower.includes('مؤسسة')) return TrendingUp;
    return Crown;
  };

  const getStatusBadgeText = (status: string): string => {
    switch (status) {
      case 'active':
        return 'نشطة';
      case 'cancelled':
        return 'ملغاة';
      case 'past_due':
        return 'متأخرة';
      default:
        return status;
    }
  };

  if (isLoadingSubscription) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div>
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-3">
            الباقات والاشتراك
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">باقتك الحالية</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            اختر الباقة المناسبة لاحتياجاتك أو قم بالترقية للحصول على المزيد من الميزات
          </p>
        </div>

        <Card className="transition-all duration-300 border-2 border-primary/40 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <Skeleton className="h-8 w-48" data-testid="skeleton-plan-title" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Skeleton className="h-4 w-32 mb-2" data-testid="skeleton-keywords-label" />
                <Skeleton className="h-2 w-full" data-testid="skeleton-keywords-progress" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-2" data-testid="skeleton-domains-label" />
                <Skeleton className="h-2 w-full" data-testid="skeleton-domains-progress" />
              </div>
            </div>
            <Skeleton className="h-12 w-40" data-testid="skeleton-price" />
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-bold mb-4">جميع الباقات المتاحة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="transition-all duration-300 border-2">
                <CardHeader>
                  <Skeleton className="h-24 w-full" data-testid={`skeleton-plan-card-${i}`} />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" data-testid={`skeleton-plan-features-${i}`} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div>
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-3">
            الباقات والاشتراك
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">لا يوجد اشتراك</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            اختر الباقة المناسبة لاحتياجاتك
          </p>
        </div>
      </div>
    );
  }

  const currentPlan = subscriptionData.plan;
  const usage = subscriptionData.usage;
  const keywordsPercentage = currentPlan.keywords_limit > 0
    ? (usage.keywords / currentPlan.keywords_limit) * 100
    : 0;
  const domainsPercentage = currentPlan.domains_limit > 0
    ? (usage.domains / currentPlan.domains_limit) * 100
    : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-3" data-testid="badge-page-category">
          الباقات والاشتراك
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2" data-testid="heading-current-plan">
          باقتك الحالية
        </h1>
        <p className="text-sm md:text-base text-muted-foreground" data-testid="text-page-description">
          اختر الباقة المناسبة لاحتياجاتك أو قم بالترقية للحصول على المزيد من الميزات
        </p>
      </div>

      <Card className="transition-all duration-300 border-2 border-primary/40 bg-gradient-to-br from-card to-primary/5" data-testid="card-current-subscription">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2" data-testid="text-current-plan-name">
              <Crown className="h-5 w-5 text-primary" data-testid="icon-plan" />
              باقة {currentPlan.name_ar}
            </span>
            <Badge variant="default" className="bg-primary" data-testid="badge-subscription-status">
              {getStatusBadgeText(subscriptionData.status)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div data-testid="container-keywords-usage">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground" data-testid="text-keywords-label">
                  استخدام الكلمات المفتاحية
                </span>
                <span className="text-sm font-bold" data-testid="text-keywords-count">
                  {usage.keywords} / {currentPlan.keywords_limit}
                </span>
              </div>
              <Progress value={keywordsPercentage} data-testid="progress-keywords" />
            </div>
            <div data-testid="container-domains-usage">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground" data-testid="text-domains-label">
                  استخدام النطاقات
                </span>
                <span className="text-sm font-bold" data-testid="text-domains-count">
                  {usage.domains} / {currentPlan.domains_limit}
                </span>
              </div>
              <Progress value={domainsPercentage} data-testid="progress-domains" />
            </div>
          </div>
          <div className="flex items-center gap-4 pt-4 border-t">
            <div className="text-3xl font-bold text-primary" data-testid="text-current-price">
              ${(currentPlan.price_monthly / 100).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground" data-testid="text-price-period">
              / شهرياً
            </div>
          </div>
          {subscriptionData.current_period_end && (
            <div className="text-sm text-muted-foreground" data-testid="text-period-end">
              ينتهي في: {format(new Date(subscriptionData.current_period_end), 'dd MMMM yyyy', { locale: ar })}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4" data-testid="heading-available-plans">جميع الباقات المتاحة</h2>
        {isLoadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="transition-all duration-300 border-2">
                <CardHeader>
                  <Skeleton className="h-24 w-full" data-testid={`skeleton-plan-card-${i}`} />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" data-testid={`skeleton-plan-features-${i}`} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans?.map((plan) => {
              const Icon = getPlanIcon(plan.name);
              const isCurrent = plan.id === currentPlan.id;
              const features = getFeaturesList(plan);

              return (
                <Card
                  key={plan.id}
                  className={`transition-all duration-300 hover:shadow-lg border-2 ${isCurrent
                    ? "border-primary/60 bg-gradient-to-br from-card to-primary/5"
                    : "hover:border-primary/40"
                    }`}
                  data-testid={`card-plan-${plan.id}`}
                >
                  <CardHeader>
                    {isCurrent && (
                      <Badge className="w-fit mb-2" variant="default" data-testid={`badge-current-plan-${plan.id}`}>
                        الباقة الحالية
                      </Badge>
                    )}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center" data-testid={`icon-container-${plan.id}`}>
                        <Icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-xl" data-testid={`text-plan-name-ar-${plan.id}`}>
                          {plan.name_ar}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground" data-testid={`text-plan-name-en-${plan.id}`}>
                          {plan.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-primary" data-testid={`text-price-monthly-${plan.id}`}>
                        ${(plan.price_monthly / 100).toFixed(2)}
                      </span>
                      <span className="text-muted-foreground" data-testid={`text-price-monthly-label-${plan.id}`}>
                        / شهر
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground" data-testid={`text-price-yearly-${plan.id}`}>
                      أو ${(plan.price_yearly / 100).toFixed(2)}/سنة
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3" data-testid={`list-features-${plan.id}`}>
                      {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm" data-testid={`text-feature-${plan.id}-${idx}`}>
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {isCurrent ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        disabled
                        data-testid={`button-current-${plan.id}`}
                      >
                        الباقة الحالية
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={plan.price_monthly > currentPlan.price_monthly ? "default" : "outline"}
                        onClick={() => handlePayWithPaymob(plan)}
                        data-testid={plan.price_monthly > currentPlan.price_monthly ? `button-upgrade-${plan.id}` : `button-downgrade-${plan.id}`}
                      >
                        {plan.price_monthly > currentPlan.price_monthly ? "الترقية الآن" : "النزول لهذه الباقة"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-chart-2/10 border-2 border-primary/20" data-testid="card-contact-sales">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2" data-testid="heading-custom-solution">
                هل تحتاج إلى حل مخصص؟
              </h3>
              <p className="text-muted-foreground" data-testid="text-custom-solution-description">
                تواصل معنا للحصول على باقة مخصصة تناسب احتياجات مؤسستك
              </p>
            </div>
            <Button size="lg" variant="default" data-testid="button-contact-sales">
              تواصل مع المبيعات
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedPlan && (
        <PaymobCheckout
          open={paymobOpen}
          onOpenChange={setPaymobOpen}
          planId={selectedPlan.id}
          planName={selectedPlan.name_ar}
          planPrice={selectedPlan.price_monthly}
        />
      )}
    </div>
  );
}
