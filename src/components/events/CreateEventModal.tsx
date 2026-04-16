import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { eventsApi } from '@/api/events';
import { toast } from 'sonner@2.0.3';

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const eventTypeMap: Record<string, string> = {
  'Bereavement': 'BEREAVEMENT',
  'Wedding': 'WEDDING',
  'School Fees': 'SCHOOL_FEES',
  'Monthly': 'MONTHLY',
  'Harambee': 'HARAMBEE',
  'Special': 'SPECIAL',
};

export function CreateEventModal({ open, onOpenChange }: CreateEventModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: '' as string,
    amountPerMember: '',
    dueDate: '',
    targetJumuia: '' as string,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.type || !formData.amountPerMember || !formData.dueDate || !formData.targetJumuia) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await eventsApi.create({
        title: formData.title,
        type: eventTypeMap[formData.type],
        amountPerMember: parseFloat(formData.amountPerMember),
        dueDate: formData.dueDate,
        targetJumuia: formData.targetJumuia,
        description: formData.description || undefined,
      });

      const updatedEvents = await eventsApi.getAll();
      useStore.getState().setEvents(updatedEvents);
      const paymentArrays = await Promise.all(updatedEvents.map(e => eventsApi.getPayments(e.id)));
      useStore.getState().setEventPayments(paymentArrays.flat());

      toast.success('Event created! Members are being notified via WhatsApp.');
      onOpenChange(false);

      setFormData({
        title: '',
        type: '',
        amountPerMember: '',
        dueDate: '',
        targetJumuia: '',
        description: '',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>Set up a new contribution event for members.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Harambee for Sr. Agnes Wedding"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bereavement">Bereavement</SelectItem>
                <SelectItem value="Wedding">Wedding</SelectItem>
                <SelectItem value="School Fees">School Fees</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Harambee">Harambee</SelectItem>
                <SelectItem value="Special">Special</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount per Member (KES) *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amountPerMember}
              onChange={(e) => setFormData({ ...formData, amountPerMember: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetJumuia">Target Jumuia *</Label>
            <Select value={formData.targetJumuia} onValueChange={(value) => setFormData({ ...formData, targetJumuia: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select target group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Jumuias</SelectItem>
                <SelectItem value="St. Peter">St. Peter</SelectItem>
                <SelectItem value="St. Paul">St. Paul</SelectItem>
                <SelectItem value="St. Joseph">St. Joseph</SelectItem>
                <SelectItem value="St. Mary">St. Mary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description for this event..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1C3D5A] hover:bg-[#2A5A7A]" disabled={submitting}>
              <Plus className="h-4 w-4 mr-2" />
              {submitting ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
