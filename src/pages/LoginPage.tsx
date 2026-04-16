import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner@2.0.3';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials or account not approved');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[#1C3D5A] to-[#2A5A7A] flex items-center justify-center shadow-xl">
              <span className="text-white text-3xl font-semibold">C</span>
            </div>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">CWA Thome Portal</h1>
          <p className="text-muted-foreground text-sm">St. Gabriel CWA Management System</p>
        </div>

        <Card className="border-border/50 backdrop-blur-sm bg-card/95">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-muted/50 border-border/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-muted/50 border-border/50"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-[#1C3D5A] hover:bg-[#2A5A7A] shadow-sm"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <div className="text-center text-sm pt-2">
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#1C3D5A] hover:underline font-medium">
                  Sign up here
                </Link>
              </div>
            </form>

            <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-medium mb-2 text-blue-900 dark:text-blue-200">Demo Credentials</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => { setEmail('admin@stgabriel.org'); setPassword(''); }}
                  className="w-full text-left text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                >
                  <span className="font-medium">Admin:</span>{' '}
                  <span className="font-mono">admin@stgabriel.org</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('monicah.wambui@gmail.com'); setPassword('CWA2026'); }}
                  className="w-full text-left text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                >
                  <span className="font-medium">Member (Monicah Wambui):</span>{' '}
                  <span className="font-mono">monicah.wambui@gmail.com</span>{' / CWA2026'}
                </button>
              </div>
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">Click a row to auto-fill credentials.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
