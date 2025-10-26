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

  const handleSend = () => {
    addNotification({
      member_id: 'bulk',
      message: message,
      date: new Date().toISOString().split('T')[0],
      type: notificationType,
      status: 'Sent',
      targetGroup: targetGroup,
      contributionType: contributionType || undefined,
      recipientCount: recipients.length,
    });

    toast.success(`Message sent to ${recipients.length} members in ${targetGroup} group!`);
    onOpenChange(false);
    
    // Reset form
    setNotificationType('Contribution Reminder');
    setTargetGroup('All Members');
    setContributionType('');
    setMessage(messageTemplates['Contribution Reminder']);
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
              disabled={recipients.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Send to {recipients.length} {recipients.length === 1 ? 'Member' : 'Members'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}