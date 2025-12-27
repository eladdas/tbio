import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Loader2 } from "lucide-react";

interface ExportReportDialogProps {
  selectedKeywordIds: string[];
  trigger?: React.ReactNode;
}

export function ExportReportDialog({ selectedKeywordIds, trigger }: ExportReportDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"pdf" | "html">("pdf");
  const [useWhiteLabel, setUseWhiteLabel] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          keywordIds: selectedKeywordIds,
          format,
          useWhiteLabel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `keyword-report-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "تم التصدير بنجاح",
        description: `تم تنزيل التقرير بصيغة ${format.toUpperCase()}`,
      });

      setOpen(false);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء التقرير",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" data-testid="button-export-report">
            <FileText className="ms-2 h-4 w-4" />
            تصدير تقرير
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تصدير تقرير الكلمات المفتاحية</DialogTitle>
          <DialogDescription>
            {selectedKeywordIds.length > 0
              ? `سيتم تصدير ${selectedKeywordIds.length} كلمة مفتاحية`
              : "سيتم تصدير جميع الكلمات المفتاحية"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>صيغة التقرير</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as "pdf" | "html")}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="pdf" id="format-pdf" data-testid="radio-format-pdf" />
                <Label htmlFor="format-pdf" className="cursor-pointer">
                  PDF - ملف PDF قابل للطباعة
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="html" id="format-html" data-testid="radio-format-html" />
                <Label htmlFor="format-html" className="cursor-pointer">
                  HTML - صفحة ويب قابلة للمشاركة
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-card-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="white-label">استخدام العلامة التجارية الخاصة</Label>
              <p className="text-sm text-muted-foreground">
                عرض معلومات شركتك بدلاً من "ترتيب"
              </p>
            </div>
            <Switch
              id="white-label"
              checked={useWhiteLabel}
              onCheckedChange={setUseWhiteLabel}
              data-testid="switch-white-label"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-export">
            إلغاء
          </Button>
          <Button onClick={handleExport} disabled={isGenerating} data-testid="button-confirm-export">
            {isGenerating && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            <Download className="ms-2 h-4 w-4" />
            تصدير
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
