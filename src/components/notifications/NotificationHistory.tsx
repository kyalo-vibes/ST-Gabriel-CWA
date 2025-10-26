import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Copy, Send, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { useStore } from '../../store/useStore';
import { useState } from 'react';

interface Notification {
  id: string;
  type: string;
  targetGroup?: string;
  contributionType?: string;
  message: string;
  date: string;
  status: string;
  recipientCount?: number;
}

interface NotificationHistoryProps {
  notifications: Notification[];
  onResend?: (notification: Notification) => void;
  onDuplicate?: (notification: Notification) => void;
}

export function NotificationHistory({ notifications, onResend, onDuplicate }: NotificationHistoryProps) {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const { members } = useStore();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Contribution Reminder':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Event Announcement':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Thank You':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Fundraising':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Get recipients based on target group
  const getRecipients = (notification: Notification) => {
    if (!notification.targetGroup) return [];
    
    let filtered = members;

    switch (notification.targetGroup) {
      case 'Active Members':
        filtered = filtered.filter(m => m.status === 'Active');
        break;
      case 'Defaulters':
        filtered = filtered.filter(m => m.balance > 0);
        break;
      case 'Inactive Members':
        filtered = filtered.filter(m => m.status === 'Inactive');
        break;
    }

    return filtered;
  };

  const bulkNotifications = notifications.filter(n => n.targetGroup);

  return (
    <>
      <div className="space-y-4">
        {bulkNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No bulk notifications sent yet
            </CardContent>
          </Card>
        ) : (
          bulkNotifications
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((notification) => (
              <Card key={notification.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      {notification.contributionType && (
                        <Badge variant="outline">{notification.contributionType}</Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(notification.date).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>
                      Sent to <strong>{notification.recipientCount || 0}</strong> members in{' '}
                      <strong>{notification.targetGroup}</strong> group
                    </span>
                  </div>
                  
                  <p className="text-sm line-clamp-2">{notification.message}</p>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedNotification(notification)}
                    >
                      <Users className="h-3 w-3 mr-1" />
                      View Recipients
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResend?.(notification)}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Resend
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDuplicate?.(notification)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Duplicate
                    </Button>
                  </div>
                  
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {notification.status}
                  </Badge>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* Details Dialog with Recipients List */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Notification Recipients</DialogTitle>
            <DialogDescription>
              View the list of recipients for this notification.
            </DialogDescription>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500">Type:</span>
                <p>{selectedNotification.type}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Target Group:</span>
                <p>{selectedNotification.targetGroup}</p>
              </div>
              {selectedNotification.contributionType && (
                <div>
                  <span className="text-sm text-gray-500">Contribution Type:</span>
                  <p>{selectedNotification.contributionType}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-500">Total Recipients:</span>
                <p>{selectedNotification.recipientCount || 0} members</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Message:</span>
                <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                  {selectedNotification.message}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 mb-2 block">Recipient List:</span>
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div className="space-y-2">
                    {getRecipients(selectedNotification).map((member, index) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <div>
                          <p className="text-sm">{index + 1}. {member.name}</p>
                          <p className="text-xs text-gray-500">{member.phone}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {member.jumuia}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div>
                <span className="text-sm text-gray-500">Sent:</span>
                <p>{new Date(selectedNotification.date).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}