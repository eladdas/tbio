import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { countries } from "@/lib/countries";

interface EditKeywordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyword: {
    id: string;
    keyword: string;
    target_location: string;
    device_type: string;
    is_active: boolean;
    tags?: string[];
  };
  onSubmit: (data: { keyword: string; target_location: string; device_type: string; is_active: boolean; tags?: string[] }) => void;
  isPending?: boolean;
}

export function EditKeywordDialog({
  open,
  onOpenChange,
  keyword,
  onSubmit,
  isPending = false,
}: EditKeywordDialogProps) {
  const [formData, setFormData] = useState({
    keyword: keyword.keyword,
    target_location: keyword.target_location,
    device_type: keyword.device_type,
    is_active: keyword.is_active,
    tags: keyword.tags || [],
  });
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData({ ...formData, tags: [...formData.tags, trimmedTag] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل الكلمة المفتاحية</DialogTitle>
          <DialogDescription>
            قم بتعديل تفاصيل الكلمة المفتاحية
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyword">الكلمة المفتاحية</Label>
              <Input
                id="keyword"
                value={formData.keyword}
                onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                placeholder="أدخل الكلمة المفتاحية"
                required
                data-testid="input-edit-keyword"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">الموقع المستهدف</Label>
              <Select
                value={formData.target_location}
                onValueChange={(value) => setFormData({ ...formData, target_location: value })}
              >
                <SelectTrigger data-testid="select-edit-location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{country.flag}</span>
                        <span>{country.nameAr}</span>
                        <span className="text-xs text-muted-foreground">({country.name})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="device">نوع الجهاز</Label>
              <Select
                value={formData.device_type}
                onValueChange={(value) => setFormData({ ...formData, device_type: value })}
              >
                <SelectTrigger data-testid="select-edit-device">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">ديسكتوب</SelectItem>
                  <SelectItem value="mobile">موبايل</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_active">الحالة</Label>
              <Select
                value={formData.is_active ? "true" : "false"}
                onValueChange={(value) => setFormData({ ...formData, is_active: value === "true" })}
              >
                <SelectTrigger data-testid="select-edit-active">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">نشط</SelectItem>
                  <SelectItem value="false">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">الوسوم (اختياري)</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-tags"
                  placeholder="أضف وسم..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  disabled={isPending}
                  data-testid="input-edit-tags"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || isPending}
                  data-testid="button-edit-add-tag"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1" data-testid={`badge-edit-tag-${tag}`}>
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover-elevate rounded-full"
                        disabled={isPending}
                        data-testid={`button-edit-remove-tag-${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending} data-testid="button-submit-edit-keyword">
              {isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
