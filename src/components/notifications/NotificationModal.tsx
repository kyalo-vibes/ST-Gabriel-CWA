import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Send, Users } from 'lucide-react';
import { MessagePreview } from './MessagePreview';
import { RecipientSummary } from './RecipientSummary';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner@2.0.3';

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const messageTemplates = {
  'Contribution Reminder': 'Dear {name}, this is a friendly reminder to complete your {contributionType} contribution of KES {amount} before {dueDate}. Thank you!',
  'Event Announcement': 'Dear Members, please note our next C.W.A. meeting is scheduled for {date} at {time}. We look forward to seeing you!',
  'General Update': 'Dear {name}, we would like to inform you about an important update regarding our community welfare programs.',
  'Thank You': 'Dear {name}, thank you for your generous contribution of KES {amount} to our {contributionType} fund. God bless you!',
  'Fundraising': 'Dear Members, we are organizing a fundraising event for {purpose}. Your support would be greatly appreciated.'
};

export function NotificationModal({ open, onOpenChange }: NotificationModalProps) {
  const { members, addNotification, activeFilters } = useStore();
  const [notificationType, setNotificationType] = useState('Contribution Reminder');
  const [targetGroup, setTargetGroup] = useState('All Members');
  const [contributionType, setContributionType] = useState('');
  const [message, setMessage] = useState(messageTemplates['Contribution Reminder']);
  const [sendMode, setSendMode] = useState<'group' | 'individual'>('group');

  useEffect(() => {
    setMessage(messageTemplates[notificationType as keyof typeof messageTemplates] || '');
  }, [notificationType]);

  const getFilteredMembers = () => {
    let filtered = members;

    switch (targetGroup) {
      case 'Active Members':
        filtered = filtered.filter(m => m.status === 'Active');
        break;
      case 'Defaulters':
        filtered = filtered.filter(m => m.balance > 0);
        break;
      case 'Inactive Members':
        filtered = filtered.filter(m => m.status === 'Inactive');
        break;
      case 'St. Peter':
      case 'St. Paul':
      case 'St. Joseph':
      case 'St. Mary':
        filtered = filtered.filter(m => m.jumuia === targetGroup);
        break;
      case 'Custom Filter':
        // Apply active filters from the store
        if (activeFilters) {
          if (activeFilters.status && activeFilters.status.length > 0) {
            filtered = filtered.filter(m => activeFilters.status!.includes(m.status));
          }
          if (activeFilters.jumuia && activeFilters.jumuia.length > 0) {
            filtered = filtered.filter(m => activeFilters.jumuia!.includes(m.jumuia));
          }
          if (activeFilters.minBalance) {
            filtered = filtered.filter(m => m.balance >= activeFilters.minBalance!);
          }
          if (activeFilters.maxBalance) {
            filtered = filtered.filter(m => m.balance <= activeFilters.maxBalance!);
          }
        }
        break;
    }

    return filtered;
  };

  const recipients = getFilteredMembers();
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const body =
        sendMode === 'group'
          ? {
              mode: 'group',
              groupId: '254708306865-1618479657@g.us', // placeholder - update after first QR scan
              message,
              notificationType,
              targetGroup,
            }
          : {
              mode: 'individual',
              message,
              recipients: recipients.map(m => ({ name: m.name, phone: m.phone, balance: m.balance })),
              notificationType,
              targetGroup,
            };

      const res = await fetch('http://localhost:3001/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send message');

      addNotification({
        member_id: 'bulk',
        message,
        date: new Date().toISOString().split('T')[0],
        type: notificationType,
        status: 'Sent',
        targetGroup,
        contributionType: contributionType || undefined,
        recipientCount: data.sent,
      });

      toast.success(
        sendMode === 'individual'
          ? `Messages sent to ${data.sent} members individually!`
          : 'Message sent to WhatsApp group!'
      );
      onOpenChange(false);

      // Reset form
      setNotificationType('Contribution Reminder');
      setTargetGroup('All Members');
      setContributionType('');
      setMessage(messageTemplates['Contribution Reminder']);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send message';
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Notification</DialogTitle>
          <DialogDescription>
            Send a notification to a group of members.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Notification Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Notification Type</Label>
            <Select value={notificationType} onValueChange={setNotificationType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Contribution Reminder">Contribution Reminder</SelectItem>
                <SelectItem value="Event Announcement">Event Announcement</SelectItem>
                <SelectItem value="General Update">General Update</SelectItem>
                <SelectItem value="Thank You">Thank You</SelectItem>
                <SelectItem value="Fundraising">Fundraising</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Send Mode Toggle */}
          <div className="space-y-2">
            <Label>Send Mode</Label>
            <div className="flex rounded-md overflow-hidden border border-gray-300 w-fit">
              <button
                type="button"
                onClick={() => setSendMode('group')}
                className={`px-4 py-2 text-sm ${sendMode === 'group' ? 'bg-[#1C3D5A] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Group Message
              </button>
              <button
                type="button"
                onClick={() => setSendMode('individual')}
                className={`px-4 py-2 text-sm border-l border-gray-300 ${sendMode === 'individual' ? 'bg-[#1C3D5A] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Individual Messages
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {sendMode === 'group'
                ? 'Sends one message to the WhatsApp group chat.'
                : 'Sends a personalised message to each member\'s phone. Placeholders like {name} and {balance} will be substituted.'}
            </p>
          </div>

          {/* Target Group */}
          <div className="space-y-2">
            <Label htmlFor="group">Target Group</Label>
            <Select value={targetGroup} onValueChange={setTargetGroup}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Members">All Members</SelectItem>
                <SelectItem value="Active Members">Active Members</SelectItem>
                <SelectItem value="Inactive Members">Inactive Members</SelectItem>
                <SelectItem value="Defaulters">Defaulters (Outstanding Balance)</SelectItem>
                <SelectItem value="St. Peter">St. Peter</SelectItem>
                <SelectItem value="St. Paul">St. Paul</SelectItem>
                <SelectItem value="St. Joseph">St. Joseph</SelectItem>
                <SelectItem value="St. Mary">St. Mary</SelectItem>
                <SelectItem value="Custom Filter">Custom Filter (From Members Page)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contribution Type (conditional) */}
          {(notificationType === 'Contribution Reminder' || notificationType === 'Thank You') && (
            <div className="space-y-2">
              <Label htmlFor="contributionType">Contribution Type (Optional)</Label>
              <Select value={contributionType} onValueChange={setContributionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Welfare">Welfare</SelectItem>
                  <SelectItem value="Project">Project</SelectItem>
                  <SelectItem value="Monthly Contribution">Monthly Contribution</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Recipient Summary */}
          <RecipientSummary count={recipients.length} group={targetGroup} />

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message">Custom Message</Label>
            <Textarea
              id="message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
            />
            <p className="text-xs text-gray-500">
              Available placeholders: {'{name}'}, {'{contributionType}'}, {'{amount}'}, {'{dueDate}'}, {'{balance}'}, {'{date}'}, {'{time}'}
            </p>
          </div>

          {/* Preview Pane */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <MessagePreview message={message} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              className="bg-[#1C3D5A] hover:bg-[#2A5A7A]"
              disabled={isSending || recipients.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? 'Sending...' : `Send to ${recipients.length} ${recipients.length === 1 ? 'Member' : 'Members'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}