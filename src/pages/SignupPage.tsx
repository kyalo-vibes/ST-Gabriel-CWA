import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { membersApi } from '@/api/members';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const JUMUIA_ENUM: Record<string, string> = {
  'St. Peter': 'ST_PETER',
  'St. Paul': 'ST_PAUL',
  'St. Joseph': 'ST_JOSEPH',
  'St. Mary': 'ST_MARY',
};

export function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    jumuia: '',
    joinDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.password || !formData.jumuia) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      await membersApi.create({
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        email: formData.email,
        jumuia: JUMUIA_ENUM[formData.jumuia] ?? formData.jumuia,
        joinDate: formData.joinDate,
      });
      toast.success('Registration submitted! Awaiting admin approval.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1C3D5A] to-[#2A5A7A] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Member Account</CardTitle>
          <CardDescription className="text-center">
            Join St. Gabriel CWA Thome Community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
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
                  <SelectValue placeholder="Select your Jumuia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="St. Peter">St. Peter</SelectItem>
                  <SelectItem value="St. Paul">St. Paul</SelectItem>
                  <SelectItem value="St. Joseph">St. Joseph</SelectItem>
                  <SelectItem value="St. Mary">St. Mary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Join Date */}
            <div className="space-y-2">
              <Label htmlFor="joinDate">Date of Joining *</Label>
              <Input
                id="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                required
              />
            </div>

            {/* Password Fields */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter your password"
                required
              />
            </div>

            {/* Info Message */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Your account will be reviewed by an administrator. You will be notified once your account is approved.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#1C3D5A] hover:bg-[#2A5A7A]"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </Button>

            {/* Login Link */}
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[#1C3D5A] hover:underline">
                Sign in here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}