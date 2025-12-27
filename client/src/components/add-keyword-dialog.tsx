import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useQuery } from "@tanstack/react-query";
import type { Domain } from "@shared/schema";

interface AddKeywordDialogProps {
  onAdd?: (keyword: string, domainId: string, targetLocation: string, deviceType: string, tags?: string[]) => void;
  isPending?: boolean;
}

export function AddKeywordDialog({ onAdd, isPending }: AddKeywordDialogProps) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [domainId, setDomainId] = useState("");
  const [targetLocation, setTargetLocation] = useState("SA");
  const [deviceType, setDeviceType] = useState("desktop");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const { data: domains = [], isLoading: domainsLoading } = useQuery<Domain[]>({
    queryKey: ['/api/domains'],
  });

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword && domainId) {
      onAdd?.(keyword, domainId, targetLocation, deviceType, tags);
      setKeyword("");
      setDomainId("");
      setTargetLocation("SA");
      setDeviceType("desktop");
      setTags([]);
      setTagInput("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-keyword" className="shadow-md hover:shadow-lg transition-all">
          <Plus className="ms-2 h-4 w-4" />
          إضافة كلمة مفتاحية
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>إضافة كلمة مفتاحية جديدة</DialogTitle>
            <DialogDescription>
              تتبع كلمة مفتاحية جديدة لأحد نطاقاتك. سيقوم النظام تلقائياً بفحص الترتيب يومياً.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="keyword">الكلمة المفتاحية</Label>
              <Input
                id="keyword"
                placeholder="مثال: أفضل أدوات SEO"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={isPending}
                data-testid="input-keyword"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domain">النطاق</Label>
              <Select value={domainId} onValueChange={setDomainId} disabled={domainsLoading || isPending}>
                <SelectTrigger id="domain" data-testid="select-domain">
                  <SelectValue placeholder={domainsLoading ? "جاري التحميل..." : domains.length === 0 ? "لا توجد نطاقات" : "اختر نطاقاً"} />
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
              <Label htmlFor="location">الموقع المستهدف</Label>
              <Select value={targetLocation} onValueChange={setTargetLocation} disabled={isPending}>
                <SelectTrigger id="location" data-testid="select-location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SA">السعودية</SelectItem>
                  <SelectItem value="AE">الإمارات</SelectItem>
                  <SelectItem value="EG">مصر</SelectItem>
                  <SelectItem value="US">الولايات المتحدة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="device">نوع الجهاز</Label>
              <Select value={deviceType} onValueChange={setDeviceType} disabled={isPending}>
                <SelectTrigger id="device" data-testid="select-device">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">ديسكتوب</SelectItem>
                  <SelectItem value="mobile">موبايل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">الوسوم (اختياري)</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="أضف وسم..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  disabled={isPending}
                  data-testid="input-tags"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || isPending}
                  data-testid="button-add-tag"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1" data-testid={`badge-tag-${tag}`}>
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover-elevate rounded-full"
                        disabled={isPending}
                        data-testid={`button-remove-tag-${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending} data-testid="button-cancel">
              إلغاء
            </Button>
            <Button type="submit" disabled={!keyword || !domainId || isPending} data-testid="button-submit">
              {isPending ? "جاري الإضافة..." : "إضافة الكلمة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
