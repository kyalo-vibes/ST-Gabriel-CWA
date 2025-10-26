import { useStore } from '../store/useStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { User, Mail, Phone, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useState } from 'react';

export function SettingsPage() {
  const { user, theme, toggleTheme } = useStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+254700000000',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl text-[#1C3D5A] dark:text-white mb-2">Settings</h1>
        <p className="text-gray-500">Manage your account and application preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            <Button type="submit" className="bg-[#1C3D5A] hover:bg-[#2A5A7A]">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {theme === 'light' ? (
                  <Sun className="h-4 w-4 text-[#D4AF37]" />
                ) : (
                  <Moon className="h-4 w-4 text-[#1C3D5A]" />
                )}
                <Label htmlFor="theme">Dark Mode</Label>
              </div>
              <p className="text-sm text-gray-500">
                Toggle between light and dark themes
              </p>
            </div>
            <Switch
              id="theme"
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive notifications via email
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive notifications via SMS
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Payment Reminders</Label>
              <p className="text-sm text-gray-500">
                Get reminded about pending payments
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Application details and support</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Version</span>
            <span className="text-sm">1.0.0</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Organization</span>
            <span className="text-sm">St. Gabriel CWA Thome</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Support Email</span>
            <span className="text-sm">support@cwa-thome.org</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Last Updated</span>
            <span className="text-sm">October 26, 2024</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}