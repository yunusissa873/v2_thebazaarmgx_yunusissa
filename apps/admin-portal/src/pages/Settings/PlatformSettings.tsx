import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAdmin } from '@thebazaar/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@thebazaar/ui/card';
import { Button } from '@thebazaar/ui/button';
import { Input } from '@thebazaar/ui/input';
import { Label } from '@thebazaar/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Settings, Save } from 'lucide-react';
import { useState } from 'react';

export default function PlatformSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<any>({});

  const { data, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin.from('system_settings').select('*');
      if (error) throw error;
      const settingsObj: any = {};
      data?.forEach((s) => {
        settingsObj[s.key] = s.value;
      });
      setSettings(settingsObj);
      return settingsObj;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabaseAdmin
        .from('system_settings')
        .upsert({
          key,
          value,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Settings updated');
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });

  const handleSave = (key: string, value: any) => {
    updateMutation.mutate({ key, value });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure platform-wide settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Site Name</Label>
            <Input
              value={settings['platform.name'] || 'The Bazaar'}
              onChange={(e) => setSettings({ ...settings, 'platform.name': e.target.value })}
              onBlur={() => handleSave('platform.name', settings['platform.name'])}
            />
          </div>
          <div>
            <Label>Support Email</Label>
            <Input
              type="email"
              value={settings['platform.support_email'] || 'support@thebazaar.com'}
              onChange={(e) => setSettings({ ...settings, 'platform.support_email': e.target.value })}
              onBlur={() => handleSave('platform.support_email', settings['platform.support_email'])}
            />
          </div>
          <div>
            <Label>Support Phone</Label>
            <Input
              value={settings['platform.support_phone'] || '+254700000000'}
              onChange={(e) => setSettings({ ...settings, 'platform.support_phone': e.target.value })}
              onBlur={() => handleSave('platform.support_phone', settings['platform.support_phone'])}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
          <CardDescription>Payment gateway configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Default Payment Method</Label>
            <select
              className="w-full px-4 py-2 border rounded-md"
              value={settings['payment.default_method'] || 'mpesa'}
              onChange={(e) => {
                setSettings({ ...settings, 'payment.default_method': e.target.value });
                handleSave('payment.default_method', e.target.value);
              }}
            >
              <option value="mpesa">M-Pesa</option>
              <option value="paystack">Paystack</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings['payment.mpesa_enabled'] !== false}
              onChange={(e) => {
                setSettings({ ...settings, 'payment.mpesa_enabled': e.target.checked });
                handleSave('payment.mpesa_enabled', e.target.checked);
              }}
            />
            <Label>Enable M-Pesa</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings['payment.paystack_enabled'] !== false}
              onChange={(e) => {
                setSettings({ ...settings, 'payment.paystack_enabled': e.target.checked });
                handleSave('payment.paystack_enabled', e.target.checked);
              }}
            />
            <Label>Enable Paystack</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>Enable or disable platform features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings['features.wishlist_enabled'] !== false}
              onChange={(e) => {
                setSettings({ ...settings, 'features.wishlist_enabled': e.target.checked });
                handleSave('features.wishlist_enabled', e.target.checked);
              }}
            />
            <Label>Enable Wishlist</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings['features.reviews_enabled'] !== false}
              onChange={(e) => {
                setSettings({ ...settings, 'features.reviews_enabled': e.target.checked });
                handleSave('features.reviews_enabled', e.target.checked);
              }}
            />
            <Label>Enable Reviews</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings['maintenance.maintenance_mode'] === true}
              onChange={(e) => {
                setSettings({ ...settings, 'maintenance.maintenance_mode': e.target.checked });
                handleSave('maintenance.maintenance_mode', e.target.checked);
              }}
            />
            <Label>Maintenance Mode</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


