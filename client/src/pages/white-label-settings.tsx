import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Building2, Globe, Mail, Palette, Image as ImageIcon } from "lucide-react";
import type { WhiteLabelSetting } from "@shared/schema";

const whiteLabelFormSchema = z.object({
  company_name: z.string().nullable(),
  company_domain: z.string().url("يجب أن يكون رابط صحيح").nullable().or(z.literal("")),
  company_email: z.string().email("يجب أن يكون بريد إلكتروني صحيح").nullable().or(z.literal("")),
  company_logo_url: z.string().url("يجب أن يكون رابط صحيح").nullable().or(z.literal("")),
  report_primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "يجب أن يكون لون صحيح بصيغة HEX").default("#4caf50"),
});

type WhiteLabelFormData = z.infer<typeof whiteLabelFormSchema>;

export default function WhiteLabelSettings() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<WhiteLabelSetting>({
    queryKey: ["/api/white-label"],
  });

  const form = useForm<WhiteLabelFormData>({
    resolver: zodResolver(whiteLabelFormSchema),
    defaultValues: {
      company_name: settings?.company_name || "",
      company_domain: settings?.company_domain || "",
      company_email: settings?.company_email || "",
      company_logo_url: settings?.company_logo_url || "",
      report_primary_color: settings?.report_primary_color || "#4caf50",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: WhiteLabelFormData) => {
      return await apiRequest("PUT", "/api/white-label", {
        company_name: data.company_name || null,
        company_domain: data.company_domain || null,
        company_email: data.company_email || null,
        company_logo_url: data.company_logo_url || null,
        report_primary_color: data.report_primary_color,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/white-label"] });
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث إعدادات العلامة التجارية",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل حفظ الإعدادات",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WhiteLabelFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loader-white-label" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">إعدادات العلامة التجارية</h1>
        <p className="text-muted-foreground">
          قم بتخصيص التقارير بعلامتك التجارية الخاصة
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات الشركة</CardTitle>
          <CardDescription>
            سيتم استخدام هذه المعلومات في التقارير المصدرة عند تفعيل خيار العلامة التجارية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      اسم الشركة
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="مثال: شركة التسويق الرقمي"
                        data-testid="input-company-name"
                      />
                    </FormControl>
                    <FormDescription>
                      سيظهر في رأس التقرير بدلاً من "ترتيب"
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      موقع الشركة
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="https://example.com"
                        type="url"
                        data-testid="input-company-domain"
                      />
                    </FormControl>
                    <FormDescription>
                      سيظهر في تذييل التقرير
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      البريد الإلكتروني
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="info@example.com"
                        type="email"
                        data-testid="input-company-email"
                      />
                    </FormControl>
                    <FormDescription>
                      سيظهر في تذييل التقرير
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      رابط الشعار
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="https://example.com/logo.png"
                        type="url"
                        data-testid="input-company-logo"
                      />
                    </FormControl>
                    <FormDescription>
                      رابط مباشر لصورة الشعار (سيظهر في رأس التقرير)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="report_primary_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      اللون الأساسي
                    </FormLabel>
                    <div className="flex gap-3 items-center">
                      <FormControl>
                        <Input
                          {...field}
                          type="color"
                          className="w-20 h-10 cursor-pointer"
                          data-testid="input-primary-color"
                        />
                      </FormControl>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="#4caf50"
                          className="flex-1"
                          data-testid="input-primary-color-hex"
                        />
                      </FormControl>
                    </div>
                    <FormDescription>
                      سيستخدم في عناوين وحدود التقرير
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-save-white-label"
                >
                  {updateMutation.isPending && (
                    <Loader2 className="w-4 h-4 ms-2 animate-spin" />
                  )}
                  حفظ التغييرات
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
