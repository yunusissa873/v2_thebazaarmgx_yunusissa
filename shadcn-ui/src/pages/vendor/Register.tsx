/**
 * Vendor Register Page
 * 
 * Multi-step vendor registration wizard
 * 
 * @author The Bazaar Development Team
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function VendorRegister() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Account creation
  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  // Step 2: Business information
  const [businessData, setBusinessData] = useState({
    business_name: '',
    business_type: '',
    registration_number: '',
    description: '',
    phone: '',
    address: '',
    city: '',
  });

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accountData.password !== accountData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign up user
      const { error: signUpError } = await signUp({
        email: accountData.email,
        password: accountData.password,
        fullName: accountData.fullName,
        role: 'vendor',
        phone: businessData.phone,
      });

      if (signUpError) {
        toast({
          title: 'Registration failed',
          description: signUpError.message || 'Failed to create account',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not found after signup');
      }

      // Create vendor profile
      const slug = businessData.business_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const { error: vendorError } = await supabase.from('vendors').insert({
        profile_id: user.id,
        business_name: businessData.business_name,
        slug: `${slug}-${Date.now()}`,
        description: businessData.description,
        business_type: businessData.business_type,
        business_registration_number: businessData.registration_number,
        phone: businessData.phone,
        email: accountData.email,
        address: businessData.address,
        city: businessData.city,
        country: 'Kenya',
      });

      if (vendorError) {
        toast({
          title: 'Error',
          description: 'Failed to create vendor profile',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      toast({
        title: 'Registration successful',
        description: 'Your vendor account has been created!',
      });

      navigate('/vendor/dashboard');
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
      <Card className="w-full max-w-2xl bg-[#1F1F1F] border-[#2F2F2F]">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">
            <span className="text-[#E50914]">The</span> Bazaar
          </CardTitle>
          <CardDescription className="text-gray-400">
            Vendor Registration - Step {step} of 2
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={accountData.fullName}
                  onChange={(e) => setAccountData({ ...accountData, fullName: e.target.value })}
                  required
                  className="bg-[#141414] border-[#2F2F2F] text-white"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={accountData.email}
                  onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                  required
                  className="bg-[#141414] border-[#2F2F2F] text-white"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={accountData.password}
                  onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                  required
                  minLength={8}
                  className="bg-[#141414] border-[#2F2F2F] text-white"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={accountData.confirmPassword}
                  onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                  required
                  className="bg-[#141414] border-[#2F2F2F] text-white"
                />
              </div>
              <Button type="submit" className="w-full bg-[#E50914] hover:bg-[#c11119]">
                Next: Business Information
              </Button>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div>
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={businessData.business_name}
                  onChange={(e) => setBusinessData({ ...businessData, business_name: e.target.value })}
                  required
                  className="bg-[#141414] border-[#2F2F2F] text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_type">Business Type</Label>
                  <Input
                    id="business_type"
                    value={businessData.business_type}
                    onChange={(e) => setBusinessData({ ...businessData, business_type: e.target.value })}
                    placeholder="e.g., Retail, Wholesale"
                    className="bg-[#141414] border-[#2F2F2F] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="registration_number">Registration Number</Label>
                  <Input
                    id="registration_number"
                    value={businessData.registration_number}
                    onChange={(e) => setBusinessData({ ...businessData, registration_number: e.target.value })}
                    className="bg-[#141414] border-[#2F2F2F] text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={businessData.description}
                  onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                  rows={4}
                  className="bg-[#141414] border-[#2F2F2F] text-white"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={businessData.phone}
                  onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                  required
                  className="bg-[#141414] border-[#2F2F2F] text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={businessData.address}
                    onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                    className="bg-[#141414] border-[#2F2F2F] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={businessData.city}
                    onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                    className="bg-[#141414] border-[#2F2F2F] text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-[#2F2F2F]"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#E50914] hover:bg-[#c11119]"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          )}
          <div className="mt-4 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/vendor/login" className="text-[#E50914] hover:underline">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
