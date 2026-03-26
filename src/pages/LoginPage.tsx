import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner@2.0.3';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState('admin');
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password, accountType);
      if (success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials or account pending approval');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl">
              <span className="text-white text-3xl font-semibold">C</span>
            </div>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">CWA Thome Portal</h1>
          <p className="text-muted-foreground text-sm">
            St. Gabriel CWA Management System
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 backdrop-blur-sm bg-card/95">
          <CardContent className="pt-6">
            <Tabs value={accountType} onValueChange={setAccountType} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1">
                <TabsTrigger 
                  value="admin" 
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Admin Login
                </TabsTrigger>
                <TabsTrigger 
                  value="member"
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Member Login
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="admin">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@cwa-thome.org"
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
                    className="w-full h-11 bg-primary hover:bg-primary-hover shadow-sm"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login as Admin'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="member">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="member-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="member-email"
                      type="email"
                      placeholder="member@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 bg-muted/50 border-border/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setEmail('monicah.wambui@gmail.com')}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Use test member email
                    </button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="member-password"
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
                    className="w-full h-11 bg-primary hover:bg-primary-hover shadow-sm"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login as Member'}
                  </Button>
                  
                  <div className="text-center text-sm pt-2">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary hover:underline font-medium">
                      Sign up here
                    </Link>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
            
            {/* Demo Info */}
            <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-medium mb-2 text-blue-900 dark:text-blue-200">Demo Credentials</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setEmail('admin@cwa-thome.org')}
                  className="w-full text-left text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                >
                  <span className="font-medium">Admin:</span>{' '}
                  <span className="font-mono">admin@cwa-thome.org</span>{' '}/ any password
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('monicah.wambui@gmail.com'); setAccountType('member'); }}
                  className="w-full text-left text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                >
                  <span className="font-medium">Member (Monicah Wambui):</span>{' '}
                  <span className="font-mono">monicah.wambui@gmail.com</span>{' '}/ any password
                </button>
              </div>
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">Click a row to auto-fill the email field.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}