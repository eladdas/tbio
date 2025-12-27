import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, TrendingUp, TrendingDown, MapPin, X } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Notification {
  id: string;
  user_id: string;
  keyword_id: string | null;
  type: string;
  title: string;
  message: string;
  old_position: number | null;
  new_position: number | null;
  is_read: boolean;
  created_at: string;
  keyword?: {
    id: string;
    keyword: string;
    domain: {
      domain: string;
    };
  };
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread-count'],
    refetchInterval: 30000,
  });

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications?limit=10');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    enabled: isOpen,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest('PATCH', `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل تعليم الإشعار كمقروء",
        variant: "destructive",
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('PATCH', '/api/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      toast({
        title: "تم بنجاح",
        description: "تم تعليم جميع الإشعارات كمقروءة",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل تعليم الإشعارات كمقروءة",
        variant: "destructive",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest('DELETE', `/api/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف الإشعار",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل حذف الإشعار",
        variant: "destructive",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'position_improved':
        return <TrendingUp className="h-4 w-4 text-chart-2" />;
      case 'position_declined':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      case 'position_found':
        return <MapPin className="h-4 w-4 text-chart-3" />;
      case 'position_lost':
        return <X className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          data-testid="button-notifications" 
          className="h-9 w-9 relative"
        >
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
          {unreadCount && unreadCount.count > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              data-testid="badge-unread-count"
            >
              {unreadCount.count > 9 ? '9+' : unreadCount.count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 md:w-96 max-h-[500px]"
        data-testid="dropdown-notifications"
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">الإشعارات</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              data-testid="button-mark-all-read"
            >
              تعليم الكل كمقروء
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              جارٍ التحميل...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              لا توجد إشعارات جديدة
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="p-3 cursor-pointer focus:bg-muted/50 hover-elevate"
                  onClick={() => handleNotificationClick(notification)}
                  data-testid={`notification-item-${notification.id}`}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm text-right flex-1">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-[#4caf50] flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground text-right line-clamp-2">
                        {notification.message}
                      </p>
                      {notification.keyword && (
                        <p className="text-xs text-muted-foreground/80 text-right">
                          {notification.keyword.domain.domain}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/60 text-right">
                        {formatDistanceToNow(new Date(notification.created_at), { 
                          addSuffix: true,
                          locale: ar 
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotificationMutation.mutate(notification.id);
                      }}
                      data-testid={`button-delete-${notification.id}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link href="/notifications">
                <Button
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => setIsOpen(false)}
                  data-testid="button-view-all"
                >
                  عرض جميع الإشعارات
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
