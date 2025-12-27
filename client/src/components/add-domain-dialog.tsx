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
import { Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddDomainDialogProps {
    onAdd?: (domain: string) => void;
}

export function AddDomainDialog({ onAdd }: AddDomainDialogProps) {
    const [open, setOpen] = useState(false);
    const [domain, setDomain] = useState("");
    const { toast } = useToast();

    const addDomainMutation = useMutation({
        mutationFn: async (domainName: string) => {
            const response = await apiRequest("POST", "/api/domains", { domain: domainName });
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
            toast({
                title: "تم إضافة النطاق بنجاح",
                description: "تم إضافة النطاق الجديد إلى قائمتك",
            });
            setDomain("");
            setOpen(false);
            onAdd?.(domain);
        },
        onError: (error: Error) => {
            const errorMessage = error.message;
            toast({
                title: "خطأ في إضافة النطاق",
                description: errorMessage.includes("Domain limit reached")
                    ? errorMessage.split(":")[1]?.trim() || "لقد وصلت إلى الحد الأقصى للنطاقات"
                    : "حدث خطأ أثناء إضافة النطاق",
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (domain.trim()) {
            addDomainMutation.mutate(domain.trim());
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    data-testid="button-add-domain"
                    className="shadow-md hover:shadow-lg transition-all"
                >
                    <Plus className="me-2 h-4 w-4" />
                    إضافة نطاق جديد
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>إضافة نطاق جديد</DialogTitle>
                        <DialogDescription>
                            أضف نطاقاً جديداً لتتبع كلماته المفتاحية في محركات البحث.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="domain">اسم النطاق</Label>
                            <Input
                                id="domain"
                                placeholder="مثال: example.com"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                data-testid="input-domain"
                                disabled={addDomainMutation.isPending}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                أدخل النطاق بدون http:// أو https://
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={addDomainMutation.isPending}
                        >
                            إلغاء
                        </Button>
                        <Button
                            type="submit"
                            data-testid="button-submit-domain"
                            disabled={addDomainMutation.isPending}
                        >
                            {addDomainMutation.isPending ? "جاري الإضافة..." : "إضافة النطاق"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
