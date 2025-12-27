import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, CreditCard, User as UserIcon, Building2, MapPin } from "lucide-react";
import type { User } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });

  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  const [accountData, setAccountData] = useState({
    account_type: "individual",
    company_name: "",
  });

  const [billingData, setBillingData] = useState({
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "SA",
  });

  // Update state when user data is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
      });
      setAccountData({
        account_type: user.account_type || "individual",
        company_name: user.company_name || "",
      });
      setBillingData({
        street: (user.billing_address as any)?.street || "",
        city: (user.billing_address as any)?.city || "",
        state: (user.billing_address as any)?.state || "",
        postal_code: (user.billing_address as any)?.postal_code || "",
        country: (user.billing_address as any)?.country || "SA",
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('PATCH', '/api/user/profile', data);
      return await res.json();
    },
    onSuccess: (updatedUser: User) => {
      // Optimistic update
      queryClient.setQueryData(['/api/auth/user'], (old: User | undefined) => {
        if (!old) return updatedUser;
        return { ...old, ...updatedUser };
      });

      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث معلوماتك الشخصية",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل تحديث المعلومات",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      phone: profileData.phone,
    });
  };

  const handleSaveAccountType = () => {
    updateProfileMutation.mutate({
      account_type: accountData.account_type,
      company_name: accountData.company_name,
    });
  };

  const handleSaveBillingAddress = () => {
    updateProfileMutation.mutate({
      billing_address: {
        street: billingData.street,
        city: billingData.city,
        state: billingData.state,
        postal_code: billingData.postal_code,
        country: billingData.country,
      },
    });
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground mt-2">إدارة معلومات حسابك وإعداداتك</p>
      </div>

      <Separator />

      {/* المعلومات الشخصية */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            <CardTitle>المعلومات الشخصية</CardTitle>
          </div>
          <CardDescription>
            قم بتحديث معلوماتك الشخصية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">الاسم الأول</Label>
              <Input
                id="first_name"
                value={profileData.first_name}
                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                placeholder="أدخل الاسم الأول"
                data-testid="input-first-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">اسم العائلة</Label>
              <Input
                id="last_name"
                value={profileData.last_name}
                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                placeholder="أدخل اسم العائلة"
                data-testid="input-last-name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              value={user?.email || ""}
              disabled
              className="bg-muted"
              data-testid="input-email"
            />
            <p className="text-sm text-muted-foreground">
              البريد الإلكتروني مرتبط بحساب Replit ولا يمكن تغييره
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              placeholder="مثال: +966501234567"
              data-testid="input-phone"
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={updateProfileMutation.isPending}
            className="w-full sm:w-auto"
            data-testid="button-save-profile"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="me-2 h-4 w-4" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* نوع الحساب */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>نوع الحساب</CardTitle>
          </div>
          <CardDescription>
            حدد نوع حسابك (فردي أو شركة)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account_type">نوع الحساب</Label>
            <Select
              value={accountData.account_type}
              onValueChange={(value) => setAccountData({ ...accountData, account_type: value })}
            >
              <SelectTrigger data-testid="select-account-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">فردي</SelectItem>
                <SelectItem value="company">شركة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {accountData.account_type === "company" && (
            <div className="space-y-2">
              <Label htmlFor="company_name">اسم الشركة</Label>
              <Input
                id="company_name"
                value={accountData.company_name}
                onChange={(e) => setAccountData({ ...accountData, company_name: e.target.value })}
                placeholder="أدخل اسم الشركة"
                data-testid="input-company-name"
              />
            </div>
          )}

          <Button
            onClick={handleSaveAccountType}
            disabled={updateProfileMutation.isPending}
            className="w-full sm:w-auto"
            data-testid="button-save-account-type"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="me-2 h-4 w-4" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* عنوان الفاتورة */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle>عنوان الفاتورة</CardTitle>
          </div>
          <CardDescription>
            قم بتحديث عنوان الفاتورة الخاص بك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">الشارع</Label>
            <Input
              id="street"
              value={billingData.street}
              onChange={(e) => setBillingData({ ...billingData, street: e.target.value })}
              placeholder="أدخل عنوان الشارع"
              data-testid="input-street"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">المدينة</Label>
              <Input
                id="city"
                value={billingData.city}
                onChange={(e) => setBillingData({ ...billingData, city: e.target.value })}
                placeholder="أدخل المدينة"
                data-testid="input-city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">المنطقة/الولاية</Label>
              <Input
                id="state"
                value={billingData.state}
                onChange={(e) => setBillingData({ ...billingData, state: e.target.value })}
                placeholder="أدخل المنطقة"
                data-testid="input-state"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="postal_code">الرمز البريدي</Label>
              <Input
                id="postal_code"
                value={billingData.postal_code}
                onChange={(e) => setBillingData({ ...billingData, postal_code: e.target.value })}
                placeholder="أدخل الرمز البريدي"
                data-testid="input-postal-code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">الدولة</Label>
              <Select
                value={billingData.country}
                onValueChange={(value) => setBillingData({ ...billingData, country: value })}
              >
                <SelectTrigger data-testid="select-country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SA">السعودية</SelectItem>
                  <SelectItem value="AE">الإمارات</SelectItem>
                  <SelectItem value="EG">مصر</SelectItem>
                  <SelectItem value="JO">الأردن</SelectItem>
                  <SelectItem value="KW">الكويت</SelectItem>
                  <SelectItem value="QA">قطر</SelectItem>
                  <SelectItem value="BH">البحرين</SelectItem>
                  <SelectItem value="OM">عمان</SelectItem>
                  <SelectItem value="LB">لبنان</SelectItem>
                  <SelectItem value="SY">سوريا</SelectItem>
                  <SelectItem value="IQ">العراق</SelectItem>
                  <SelectItem value="MA">المغرب</SelectItem>
                  <SelectItem value="TN">تونس</SelectItem>
                  <SelectItem value="DZ">الجزائر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleSaveBillingAddress}
            disabled={updateProfileMutation.isPending}
            className="w-full sm:w-auto"
            data-testid="button-save-billing"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="me-2 h-4 w-4" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* طرق الدفع - غير فعالة مؤقتاً */}
      <Card className="opacity-60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>طرق الدفع</CardTitle>
          </div>
          <CardDescription>
            إدارة طرق الدفع الخاصة بك (قريباً)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              ستكون هذه الميزة متاحة قريباً
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              سيمكنك إضافة وإدارة بطاقات الائتمان وطرق الدفع الأخرى
            </p>
          </div>
        </CardContent>
      </Card>

      {/* كلمة المرور - ملاحظة */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold mb-1">ملاحظة حول كلمة المرور</h3>
              <p className="text-sm text-muted-foreground">
                حسابك محمي عبر Replit Auth. لتغيير كلمة المرور الخاصة بك، قم بتسجيل الدخول إلى{" "}
                <a
                  href="https://replit.com/account"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  إعدادات حساب Replit
                </a>
                .
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
