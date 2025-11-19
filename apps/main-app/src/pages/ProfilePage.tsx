import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, MapPin, Save, Settings, CreditCard, Bell, Globe, Lock } from 'lucide-react';
import { Button } from '@thebazaar/ui/button';
import { Input } from '@thebazaar/ui/input';
import { Label } from '@thebazaar/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@thebazaar/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@thebazaar/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@thebazaar/hooks/useMockData';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@thebazaar/ui/form';
import { Skeleton } from '@thebazaar/ui/skeleton';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { AddressManager } from '@/components/profile/AddressManager';
import { PaymentMethods } from '@/components/profile/PaymentMethods';
import { NotificationSettings } from '@/components/profile/NotificationSettings';

interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Get user data from mock data (using first user as mock for now)
  const mockUser = useUser('usr_001');

  // Initialize tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab') || 'profile';
    setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const form = useForm<ProfileFormData>({
    defaultValues: {
      fullName: mockUser?.full_name || user?.user_metadata?.full_name || '',
      email: mockUser?.email || user?.email || '',
      phone: mockUser?.phone || '',
      address: mockUser?.address.street || '',
      city: mockUser?.address.city || '',
      postalCode: mockUser?.address.postal_code || '',
      country: mockUser?.address.country || 'Kenya',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      // TODO: Update profile in Supabase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <div className="container-custom py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-8 w-48 bg-netflix-dark-gray" />
            <Skeleton className="h-64 w-full bg-netflix-dark-gray" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-netflix-black">
        <div className="container-custom py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">My Profile & Account Settings</h1>

            {/* Profile Avatar Header */}
            {mockUser && (
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-netflix-medium-gray">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={mockUser.profile_image_url} alt={mockUser.full_name} />
                  <AvatarFallback className="bg-netflix-medium-gray text-white text-2xl">
                    {mockUser.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-semibold text-white">{mockUser.full_name}</h2>
                  <p className="text-gray-400">{mockUser.email}</p>
                  {mockUser.phone && (
                    <p className="text-gray-400 text-sm">{mockUser.phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-netflix-dark-gray border-netflix-medium-gray">
                <TabsTrigger 
                  value="profile" 
                  className="data-[state=active]:bg-netflix-red data-[state=active]:text-white text-gray-300"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="addresses"
                  className="data-[state=active]:bg-netflix-red data-[state=active]:text-white text-gray-300"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Addresses
                </TabsTrigger>
                <TabsTrigger 
                  value="payments"
                  className="data-[state=active]:bg-netflix-red data-[state=active]:text-white text-gray-300"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payments
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications"
                  className="data-[state=active]:bg-netflix-red data-[state=active]:text-white text-gray-300"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="settings"
                  className="data-[state=active]:bg-netflix-red data-[state=active]:text-white text-gray-300"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="mt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6 space-y-4">
                      <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>

                      <FormField
                        control={form.control}
                        name="fullName"
                        rules={{ required: 'Full name is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Full Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                  type="text"
                                  className="bg-netflix-medium-gray border-netflix-medium-gray pl-10 text-white"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        rules={{
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                  type="email"
                                  disabled
                                  className="bg-netflix-medium-gray/50 border-netflix-medium-gray pl-10 text-gray-400"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Phone</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                  type="tel"
                                  placeholder="+254 712 345 678"
                                  className="bg-netflix-medium-gray border-netflix-medium-gray pl-10 text-white"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Profile Picture Upload - Placeholder */}
                      <div className="pt-4">
                        <Label className="text-white mb-2 block">Profile Picture</Label>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={mockUser?.profile_image_url} alt={mockUser?.full_name} />
                            <AvatarFallback className="bg-netflix-medium-gray text-white text-xl">
                              {mockUser?.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
                          >
                            Change Photo
                          </Button>
                        </div>
                      </div>

                      {/* Privacy Toggle - Placeholder */}
                      <div className="pt-4 border-t border-netflix-medium-gray">
                        <Label className="text-white mb-2 block">Privacy Settings</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Make reviews visible to others</span>
                            <input
                              type="checkbox"
                              defaultChecked
                              className="h-4 w-4 rounded border-gray-300 bg-netflix-medium-gray text-netflix-red focus:ring-netflix-red"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Make wishlist visible to others</span>
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 bg-netflix-medium-gray text-netflix-red focus:ring-netflix-red"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="w-full bg-netflix-red hover:bg-netflix-red/90 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Addresses Tab */}
              <TabsContent value="addresses" className="mt-6">
                <AddressManager
                  addresses={[]} // Will be loaded from user data
                  onSave={async (address) => {
                    // TODO: Save to Supabase
                    console.log('Save address:', address);
                  }}
                  onDelete={async (id) => {
                    // TODO: Delete from Supabase
                    console.log('Delete address:', id);
                  }}
                  onSetDefault={async (id) => {
                    // TODO: Update default in Supabase
                    console.log('Set default address:', id);
                  }}
                />
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="mt-6">
                <PaymentMethods
                  paymentMethods={[]} // Will be loaded from user data
                  onSave={async (method) => {
                    // TODO: Save to Supabase (encrypted)
                    console.log('Save payment method:', method);
                  }}
                  onDelete={async (id) => {
                    // TODO: Delete from Supabase
                    console.log('Delete payment method:', id);
                  }}
                  onSetDefault={async (id) => {
                    // TODO: Update default in Supabase
                    console.log('Set default payment method:', id);
                  }}
                />
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="mt-6">
                <NotificationSettings
                  onSave={async (preferences) => {
                    // TODO: Save to Supabase
                    console.log('Save notification preferences:', preferences);
                  }}
                />
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-6">
                <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Language & Currency
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white mb-2 block">Language</Label>
                        <select className="w-full bg-netflix-medium-gray border-netflix-medium-gray text-white rounded-md px-4 py-2">
                          <option value="en">English</option>
                          <option value="sw">Kiswahili</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-white mb-2 block">Currency</Label>
                        <select className="w-full bg-netflix-medium-gray border-netflix-medium-gray text-white rounded-md px-4 py-2">
                          <option value="KES">Kenyan Shilling (KES)</option>
                          <option value="USD">US Dollar (USD)</option>
                        </select>
                      </div>
                      <Button className="bg-netflix-red hover:bg-netflix-red/90 text-white">
                        Save Preferences
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-netflix-medium-gray pt-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white mb-2 block">Current Password</Label>
                        <Input
                          type="password"
                          className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <Label className="text-white mb-2 block">New Password</Label>
                        <Input
                          type="password"
                          className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <Label className="text-white mb-2 block">Confirm New Password</Label>
                        <Input
                          type="password"
                          className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <Button className="bg-netflix-red hover:bg-netflix-red/90 text-white">
                        Update Password
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

