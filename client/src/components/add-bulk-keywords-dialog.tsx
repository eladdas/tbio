import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListPlus } from "lucide-react";
import type { Domain } from "@shared/schema";

interface AddBulkKeywordsDialogProps {
  onAdd: (keywords: string[], domainId: string, targetLocation: string, deviceType: string) => void;
  isPending?: boolean;
}

export function AddBulkKeywordsDialog({ onAdd, isPending = false }: AddBulkKeywordsDialogProps) {
  const [open, setOpen] = useState(false);
  const [keywordsText, setKeywordsText] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [targetLocation, setTargetLocation] = useState("SA");
  const [deviceType, setDeviceType] = useState("desktop");

  const { data: domains = [] } = useQuery<Domain[]>({
    queryKey: ["/api/domains"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDomain || !keywordsText.trim()) {
      return;
    }

    // Split by newlines and filter empty lines
    const keywords = keywordsText
      .split('\n')
      .map(kw => kw.trim())
      .filter(kw => kw.length > 0);

    if (keywords.length === 0) {
      return;
    }

    onAdd(keywords, selectedDomain, targetLocation, deviceType);
    
    // Reset form
    setKeywordsText("");
    setSelectedDomain("");
    setTargetLocation("SA");
    setDeviceType("desktop");
    setOpen(false);
  };

  const keywordCount = keywordsText
    .split('\n')
    .filter(kw => kw.trim().length > 0).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-add-bulk-keywords">
          <ListPlus className="ms-2 h-4 w-4" />
          إضافة عدة كلمات
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>إضافة عدة كلمات مفتاحية</DialogTitle>
            <DialogDescription>
              أدخل كل كلمة مفتاحية في سطر منفصل. سيتم إضافة جميع الكلمات للنطاق المحدد.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bulk-domain">النطاق</Label>
              <Select
                value={selectedDomain}
                onValueChange={setSelectedDomain}
                required
              >
                <SelectTrigger id="bulk-domain" data-testid="select-bulk-domain">
                  <SelectValue placeholder="اختر النطاق" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      {domain.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bulk-location">الموقع المستهدف</Label>
              <Select
                value={targetLocation}
                onValueChange={setTargetLocation}
                required
              >
                <SelectTrigger id="bulk-location" data-testid="select-bulk-location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SA">السعودية</SelectItem>
                  <SelectItem value="AE">الإمارات</SelectItem>
                  <SelectItem value="EG">مصر</SelectItem>
                  <SelectItem value="KW">الكويت</SelectItem>
                  <SelectItem value="QA">قطر</SelectItem>
                  <SelectItem value="BH">البحرين</SelectItem>
                  <SelectItem value="OM">عُمان</SelectItem>
                  <SelectItem value="JO">الأردن</SelectItem>
                  <SelectItem value="LB">لبنان</SelectItem>
                  <SelectItem value="IQ">العراق</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bulk-device">نوع الجهاز</Label>
              <Select
                value={deviceType}
                onValueChange={setDeviceType}
                required
              >
                <SelectTrigger id="bulk-device" data-testid="select-bulk-device">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">ديسكتوب</SelectItem>
                  <SelectItem value="mobile">موبايل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bulk-keywords">
                  الكلمات المفتاحية (كل كلمة في سطر)
                </Label>
                {keywordCount > 0 && (
                  <span className="text-sm text-muted-foreground" data-testid="text-keyword-count">
                    {keywordCount} كلمة
                  </span>
                )}
              </div>
              <Textarea
                id="bulk-keywords"
                placeholder="أدخل الكلمات المفتاحية&#10;كل كلمة في سطر منفصل&#10;&#10;مثال:&#10;برمجة مواقع&#10;تصميم تطبيقات&#10;تطوير ويب"
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                data-testid="textarea-bulk-keywords"
                disabled={isPending}
                required
                dir="auto"
              />
              <p className="text-xs text-muted-foreground">
                💡 نصيحة: يمكنك نسخ قائمة الكلمات من Excel أو أي محرر نصوص ولصقها هنا
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending || !selectedDomain || keywordCount === 0}
              data-testid="button-submit-bulk-keywords"
            >
              {isPending ? "جاري الإضافة..." : `إضافة ${keywordCount} كلمة`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
