import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, AlertCircle } from 'lucide-react';
import { checkRateLimit, clearRateLimit, logSecurityEvent } from '@/lib/security/accessControl';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Check rate limit on mount
  useEffect(() => {
    const identifier = email || 'unknown';
    const allowed = checkRateLimit(identifier, 5, 15 * 60 * 1000);
    if (!allowed) {
      setRateLimited(true);
      toast.error('Too many login attempts. Please try again in 15 minutes.');
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rateLimited) {
      toast.error('Too many login attempts. Please try again later.');
      return;
    }

    const identifier = email || 'unknown';
    const allowed = checkRateLimit(identifier, 5, 15 * 60 * 1000);
    
    if (!allowed) {
      setRateLimited(true);
      toast.error('Too many login attempts. Please try again in 15 minutes.');
      logSecurityEvent('rate_limit_exceeded', { email, identifier });
      return;
    }

    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      // Log failed login attempt
      logSecurityEvent('failed_login_attempt', {
        email,
        error: error.message,
        userAgent: navigator.userAgent,
      });
      
      toast.error(error.message || 'Failed to sign in');
      setLoading(false);
    } else {
      // Clear rate limit on successful login
      clearRateLimit(identifier);
      logSecurityEvent('successful_login', { email });
      toast.success('Signed in successfully');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Admin Portal</CardTitle>
          <CardDescription className="text-center">
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@thebazaar.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {rateLimited && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Too many login attempts. Please try again in 15 minutes.</span>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading || rateLimited}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              ⚠️ This is a restricted admin portal. Unauthorized access is prohibited.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

