import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UserPlus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner@2.0.3';

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMemberModal({ open, onOpenChange }: AddMemberModalProps) {
  const { addMember } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    jumuia: '',
    status: 'Active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.email || !formData.jumuia) {
      toast.error('Please fill in all required fields');
      return;
    }

    addMember({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      jumuia: formData.jumuia,
      status: formData.status,
      join_date: new Date().toISOString().split('T')[0],
      total_contributed: 0,
      balance: 0,
      approvalStatus: 'Approved', // Admin-added members are auto-approved
    });

    toast.success(`${formData.name} has been added successfully!`);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      jumuia: '',
      status: 'Active',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>Enter the details of the new member.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter member's full name"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+254712345678"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              required
            />
          </div>

          {/* Jumuia */}
          <div className="space-y-2">
            <Label htmlFor="jumuia">Jumuia *</Label>
            <Select value={formData.jumuia} onValueChange={(value) => setFormData({ ...formData, jumuia: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Jumuia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="St. Peter">St. Peter</SelectItem>
                <SelectItem value="St. Paul">St. Paul</SelectItem>
                <SelectItem value="St. Joseph">St. Joseph</SelectItem>
                <SelectItem value="St. Mary">St. Mary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-[#1C3D5A] hover:bg-[#2A5A7A]"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}