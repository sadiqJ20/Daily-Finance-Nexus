
import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface Notification {
  id: string;
  type: 'payment' | 'overdue' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationCenterProps {
  loans: any[];
  payments: any[];
}

const NotificationCenter = ({ loans, payments }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    generateNotifications();
  }, [JSON.stringify(loans), JSON.stringify(payments)]);

  const generateNotifications = () => {
    const today = new Date().toISOString().split('T')[0];
    const newNotifications: Notification[] = [];

    // Check for overdue payments
    loans.forEach(loan => {
      const startDate = new Date(loan.startDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff < loan.duration) {
        const todayPayment = payments.find(p => p.loanId === loan.id && p.date === today);
        
        if (!todayPayment) {
          newNotifications.push({
            id: `pending-${loan.id}`,
            type: 'reminder',
            title: 'Payment Due Today',
            message: `${loan.shopkeeperName} has ₹${loan.dailyEmi} due today`,
            timestamp: new Date().toISOString(),
            read: false,
            priority: 'medium'
          });
        }
      }
    });

    // Check for missed payments (yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    loans.forEach(loan => {
      const missedPayment = payments.find(p => 
        p.loanId === loan.id && 
        p.date === yesterdayStr && 
        p.status === 'missed'
      );
      
      if (missedPayment) {
        newNotifications.push({
          id: `missed-${loan.id}`,
          type: 'overdue',
          title: 'Missed Payment',
          message: `${loan.shopkeeperName} missed payment of ₹${loan.dailyEmi}`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'high'
        });
      }
    });

    setNotifications(newNotifications);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'reminder': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-200';
      case 'medium': return 'bg-yellow-100 border-yellow-200';
      case 'low': return 'bg-blue-100 border-blue-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications ({unreadCount} unread)</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-3 max-h-[600px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`${getPriorityColor(notification.priority)} ${!notification.read ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;
