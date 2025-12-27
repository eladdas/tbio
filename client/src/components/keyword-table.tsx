import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Search, TrendingUp, TrendingDown, Minus, MoreVertical, LineChart, Eye, Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface KeywordData {
  id: string;
  keyword: string;
  domain: string;
  device_type: string;
  position: number;
  previousPosition: number;
  searchVolume: number;
  lastChecked: string;
}

interface KeywordTableProps {
  data: KeywordData[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCheckRanking?: (id: string) => void;
  onViewChart?: (id: string) => void;
  onPreview?: (id: string) => void;
  isCheckingRanking?: boolean;
}

export function KeywordTable({ data, onEdit, onDelete, onCheckRanking, onViewChart, onPreview, isCheckingRanking }: KeywordTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof KeywordData | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredData = data.filter(
    (item) =>
      item.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    return sortDirection === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const handleSort = (field: keyof KeywordData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getPositionChange = (current: number, previous: number) => {
    const change = previous - current;
    if (change > 0) {
      return { icon: TrendingUp, color: "text-chart-2", value: `+${change}` };
    } else if (change < 0) {
      return { icon: TrendingDown, color: "text-destructive", value: change };
    }
    return { icon: Minus, color: "text-muted-foreground", value: "0" };
  };

  const getPositionColor = (position: number) => {
    if (position <= 0) return "";
    if (position >= 1 && position <= 3) return "bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-300 border-green-500/30";
    if (position >= 4 && position <= 7) return "bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-300 border-yellow-500/30";
    return "bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-300 border-red-500/30";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن كلمات أو نطاقات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-9"
            data-testid="input-keyword-search"
          />
        </div>
      </div>

      <div className="border rounded-md overflow-x-auto" dir="rtl">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("keyword")}
                  className="-me-3 h-8"
                  data-testid="sort-keyword"
                >
                  الكلمة المفتاحية
                  <ArrowUpDown className="me-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("domain")}
                  className="-me-3 h-8"
                  data-testid="sort-domain"
                >
                  النطاق
                  <ArrowUpDown className="me-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("position")}
                  className="-me-3 h-8"
                  data-testid="sort-position"
                >
                  الترتيب
                  <ArrowUpDown className="me-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>الجهاز</TableHead>
              <TableHead>التغيير</TableHead>
              <TableHead>آخر فحص</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  لا توجد كلمات مفتاحية
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row) => {
                const change = getPositionChange(row.position, row.previousPosition);
                const ChangeIcon = change.icon;
                const DeviceIcon = row.device_type === "mobile" ? Smartphone : Monitor;
                
                return (
                  <TableRow key={row.id} data-testid={`row-keyword-${row.id}`}>
                    <TableCell className="font-medium">{row.keyword}</TableCell>
                    <TableCell className="text-muted-foreground">{row.domain}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn("font-mono", getPositionColor(row.position))}
                        data-testid={`badge-position-${row.id}`}
                      >
                        #{row.position}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <DeviceIcon className="h-4 w-4" />
                        <span className="text-sm">{row.device_type === "mobile" ? "موبايل" : "ديسكتوب"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={cn("flex items-center gap-1 text-sm font-medium", change.color)}>
                        <ChangeIcon className="h-3 w-3" />
                        <span>{change.value}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{row.lastChecked}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-actions-${row.id}`}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => onCheckRanking?.(row.id)} 
                            disabled={isCheckingRanking}
                            data-testid={`action-check-${row.id}`}
                          >
                            فحص الترتيب الآن
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewChart?.(row.id)} data-testid={`action-chart-${row.id}`}>
                            <LineChart className="ms-2 h-4 w-4" />
                            الرسم البياني
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onPreview?.(row.id)} data-testid={`action-preview-${row.id}`}>
                            <Eye className="ms-2 h-4 w-4" />
                            معاينة النتائج
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit?.(row.id)} data-testid={`action-edit-${row.id}`}>
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete?.(row.id)} className="text-destructive" data-testid={`action-delete-${row.id}`}>
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
