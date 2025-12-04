/**
 * Vendor Login Page
 * 
 * Vendor-specific login page
 * 
 * @author The Bazaar Development Team
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function VendorLogin() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn({ email, password });
      if (error) {
        toast({
          title: 'Login failed',
          description: error.message || 'Invalid email or password',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        navigate('/vendor/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1F1F1F] border-[#2F2F2F]">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">
            <span className="text-[#E50914]">The</span> Bazaar
          </CardTitle>
          <CardDescription className="text-gray-400">Vendor Portal Login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#141414] border-[#2F2F2F] text-white"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#141414] border-[#2F2F2F] text-white"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#E50914] hover:bg-[#c11119]"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/vendor/register" className="text-[#E50914] hover:underline">
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
