import { useStore } from '../store/useStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { User, Mail, Phone, Sun, Moon, MessageSquare, Loader2, CheckCircle } from 'lucide-react';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { useState } from 'react';

export function SettingsPage() {
  const { user, theme, toggleTheme, approvedGroups, setApprovedGroups } = useStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+254700000000',
  });

  // WhatsApp group registration state
  const [allGroups, setAllGroups] = useState<{ id: string; name: string }[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [loadingGroups, setLoadingGroups] = useState(false);

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

      {/* WhatsApp Groups */}
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Groups</CardTitle>
          <CardDescription>Select which groups this system is allowed to send messages to.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Currently approved groups */}
          {approvedGroups.length > 0 ? (
            <div className="space-y-1">
              {approvedGroups.map(g => (
                <div key={g.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{g.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No groups registered yet.</p>
          )}

          <Button
            variant="outline"
            onClick={async () => {
              setLoadingGroups(true);
              try {
                const res = await fetch('http://localhost:3001/whatsapp/groups');
                const data: { id: string; name: string }[] = await res.json();
                setAllGroups(data);
                // Pre-check groups that are already approved
                const approvedIds = new Set(approvedGroups.map(g => g.id));
                setSelectedGroupIds(approvedIds);
              } catch {
                toast.error('Could not connect to WhatsApp. Make sure the backend is running.');
              } finally {
                setLoadingGroups(false);
              }
            }}
            disabled={loadingGroups}
          >
            {loadingGroups ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <MessageSquare className="h-4 w-4 mr-2" />
            )}
            Load Groups from WhatsApp
          </Button>

          {/* Checkbox list of all groups fetched from the phone */}
          {allGroups.length > 0 && (
            <div className="space-y-3">
              {allGroups.map(g => (
                <div key={g.id} className="flex items-center gap-3">
                  <Checkbox
                    id={`group-${g.id}`}
                    checked={selectedGroupIds.has(g.id)}
                    onCheckedChange={(checked) => {
                      setSelectedGroupIds(prev => {
                        const next = new Set(prev);
                        if (checked) {
                          next.add(g.id);
                        } else {
                          next.delete(g.id);
                        }
                        return next;
                      });
                    }}
                  />
                  <label htmlFor={`group-${g.id}`} className="text-sm cursor-pointer">
                    {g.name}
                  </label>
                </div>
              ))}

              <Button
                className="bg-[#1C3D5A] hover:bg-[#2A5A7A]"
                onClick={() => {
                  const checked = allGroups.filter(g => selectedGroupIds.has(g.id));
                  setApprovedGroups(checked);
                  toast.success('WhatsApp groups saved!');
                }}
              >
                Save Selected Groups
              </Button>
            </div>
          )}
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