import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Send, Bell, MessageSquare } from 'lucide-react';
import { NotificationModal } from '../components/notifications/NotificationModal';
import { NotificationHistory } from '../components/notifications/NotificationHistory';
import { toast } from 'sonner@2.0.3';

export function NotificationsPage() {
  const { notifications, addNotification } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleResend = (notification: any) => {
    addNotification({
      member_id: notification.member_id,
      message: notification.message,
      date: new Date().toISOString().split('T')[0],
      type: notification.type,
      status: 'Sent',
      targetGroup: notification.targetGroup,
      contributionType: notification.contributionType,
      recipientCount: notification.recipientCount,
    });
    toast.success('Notification resent successfully!');
  };

  const handleDuplicate = (notification: any) => {
    setIsDialogOpen(true);
    toast.info('Message template loaded. Edit and send.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl text-[#1C3D5A] dark:text-white mb-2">Notifications</h1>
          <p className="text-gray-500">Send targeted WhatsApp messages to member groups</p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-[#1C3D5A] hover:bg-[#2A5A7A]"
        >
          <Send className="h-4 w-4 mr-2" />
          Send Notification
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Sent</CardTitle>
            <Bell className="h-4 w-4 text-[#1C3D5A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{notifications.length}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">This Month</CardTitle>
            <MessageSquare className="h-4 w-4 text-[#1C3D5A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {
                notifications.filter((n) => {
                  const date = new Date(n.date);
                  const now = new Date();
                  return (
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">Recent notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Delivery Rate</CardTitle>
            <Send className="h-4 w-4 text-[#1C3D5A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">100%</div>
            <p className="text-xs text-gray-500 mt-1">All delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Notification History */}
      <div>
        <h2 className="text-xl mb-4">Notification History</h2>
        <NotificationHistory 
          notifications={notifications}
          onResend={handleResend}
          onDuplicate={handleDuplicate}
        />
      </div>

      {/* Notification Modal */}
      <NotificationModal open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}