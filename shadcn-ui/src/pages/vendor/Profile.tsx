/**
 * Vendor Profile Page
 * 
 * Vendor profile and settings management
 * 
 * @author The Bazaar Development Team
 */

import { useState, useEffect } from 'react';
import { useVendorProfile } from '@/hooks/useVendorProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function VendorProfile() {
  const { vendorProfile, isLoading } = useVendorProfile();
  const [formData, setFormData] = useState({
    business_name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    website: '',
  });

  useEffect(() => {
    if (vendorProfile) {
      setFormData({
        business_name: vendorProfile.business_name || '',
        description: vendorProfile.description || '',
        phone: vendorProfile.phone || '',
        email: vendorProfile.email || '',
        address: vendorProfile.address || '',
        city: vendorProfile.city || '',
        website: vendorProfile.website || '',
      });
    }
  }, [vendorProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement update vendor profile
    console.log('Update profile:', formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-gray-400">Manage your vendor profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-[#1F1F1F] border-[#2F2F2F]">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="bg-[#141414] border-[#2F2F2F] text-white"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#141414] border-[#2F2F2F] text-white"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-[#141414] border-[#2F2F2F] text-white"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-[#141414] border-[#2F2F2F] text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-[#141414] border-[#2F2F2F] text-white"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-[#141414] border-[#2F2F2F] text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="bg-[#141414] border-[#2F2F2F] text-white"
              />
            </div>
            <Button type="submit" className="bg-[#E50914] hover:bg-[#c11119]">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
