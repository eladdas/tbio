import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, TrendingUp, TrendingDown, MapPin, X, Loader2, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

export default function Notifications() {
  const [limit, setLimit] = useState(20);
  const { toast } = useToast();

  const { data: notifications = [], isLoading, refetch, isRefetching } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', limit],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest('PATCH', `/api/notifications/${notificationId}/read`);
    },
    onSuccess: (_data, notificationId) => {
      // Optimistic update
      queryClient.setQueryData(['/api/notifications', limit], (old: Notification[] | undefined) => {
        if (!old) return old;
        return old.map(n => n.id === notificationId ? { ...n, is_read: true } : n);
      });
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
      // Optimistic update
      queryClient.setQueryData(['/api/notifications', limit], (old: Notification[] | undefined) => {
        if (!old) return old;
        return old.map(n => ({ ...n, is_read: true }));
      });
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
    onSuccess: (_data, deletedId) => {
      // Optimistic update
      queryClient.setQueryData(['/api/notifications', limit], (old: Notification[] | undefined) => {
        if (!old) return old;
        return old.filter(n => n.id !== deletedId);
      });
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
        return <TrendingUp className="h-5 w-5 text-chart-2" />;
      case 'position_declined':
        return <TrendingDown className="h-5 w-5 text-destructive" />;
      case 'position_found':
        return <MapPin className="h-5 w-5 text-chart-3" />;
      case 'position_lost':
        return <X className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationBgClass = (type: string) => {
    switch (type) {
      case 'position_improved':
        return 'bg-chart-2/10 border-chart-2/20';
      case 'position_declined':
        return 'bg-destructive/10 border-destructive/20';
      case 'position_found':
        return 'bg-chart-3/10 border-chart-3/20';
      case 'position_lost':
        return 'bg-muted/50 border-muted';
      default:
        return 'bg-muted/50 border-muted';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-right">الإشعارات</h1>
          <p className="text-muted-foreground text-right mt-1">
            تتبع جميع التحديثات والتغييرات في ترتيب كلماتك المفتاحية
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            title="تحديث الإشعارات"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              data-testid="button-mark-all-read"
            >
              {markAllAsReadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  جارٍ التعليم...
                </>
              ) : (
                'تعليم الكل كمقروء'
              )}
            </Button>
          )}
        </div>
      </div>

      {unreadCount > 0 && (
        <Card className="bg-[#4caf50]/10 border-[#4caf50]/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-right">
              <Badge variant="default" className="bg-[#4caf50] hover:bg-[#45a049]">
                {unreadCount}
              </Badge>
              <span className="text-sm font-medium">
                لديك {unreadCount} إشعار{unreadCount > 1 ? 'ات' : ''} غير مقروء{unreadCount > 1 ? 'ة' : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4">جارٍ التحميل...</p>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mt-4">لا توجد إشعارات</h3>
            <p className="text-muted-foreground mt-2">
              عندما يحدث تغيير في ترتيب كلماتك المفتاحية، ستظهر الإشعارات هنا
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`overflow-hidden transition-all hover:shadow-md cursor-pointer group ${!notification.is_read ? getNotificationBgClass(notification.type) : ''
                  }`}
                onClick={() => handleNotificationClick(notification)}
                data-testid={`notification-card-${notification.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <h3 className="font-semibold text-base">
                              {notification.title}
                            </h3>
                            {!notification.is_read && (
                              <div className="h-2 w-2 rounded-full bg-[#4caf50] flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                      </div>

                      {notification.keyword && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground text-right flex-wrap justify-end">
                          <Badge variant="secondary" className="text-xs">
                            {notification.keyword.keyword}
                          </Badge>
                          <span>•</span>
                          <span>{notification.keyword.domain.domain}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotificationMutation.mutate(notification.id);
                          }}
                          data-testid={`button-delete-${notification.id}`}
                        >
                          <X className="h-3 w-3 ms-1" />
                          حذف
                        </Button>
                        <p className="text-xs text-muted-foreground/80">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ar
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {notifications.length >= limit && (
            <Card>
              <CardContent className="p-6 text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setLimit(prev => prev + 20)}
                  data-testid="button-load-more"
                  className="w-full sm:w-auto"
                >
                  عرض المزيد
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
