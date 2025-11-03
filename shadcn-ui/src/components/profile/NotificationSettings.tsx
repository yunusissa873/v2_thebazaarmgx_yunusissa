import { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface NotificationPreferences {
  orderUpdates: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  promotions: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  vendorMessages: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  reviews: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

interface NotificationSettingsProps {
  preferences?: NotificationPreferences;
  onSave?: (preferences: NotificationPreferences) => Promise<void>;
}

const defaultPreferences: NotificationPreferences = {
  orderUpdates: {
    email: true,
    sms: true,
    push: true,
  },
  promotions: {
    email: true,
    sms: false,
    push: true,
  },
  vendorMessages: {
    email: true,
    sms: false,
    push: true,
  },
  reviews: {
    email: true,
    sms: false,
    push: false,
  },
};

export function NotificationSettings({
  preferences = defaultPreferences,
  onSave,
}: NotificationSettingsProps) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(preferences);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (
    category: keyof NotificationPreferences,
    channel: 'email' | 'sms' | 'push',
    value: boolean
  ) => {
    setPrefs((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(prefs);
        toast.success('Notification preferences saved');
      } else {
        // Mock save - in real app, this would call an API
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success('Notification preferences saved');
      }
    } catch (error) {
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const NotificationSection = ({
    title,
    icon: Icon,
    category,
    description,
  }: {
    title: string;
    icon: React.ElementType;
    category: keyof NotificationPreferences;
    description: string;
  }) => (
    <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="h-5 w-5 text-netflix-red" />
        <div>
          <h4 className="text-white font-semibold">{title}</h4>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <Label htmlFor={`${category}-email`} className="text-white cursor-pointer">
              Email
            </Label>
          </div>
          <Switch
            id={`${category}-email`}
            checked={prefs[category].email}
            onCheckedChange={(checked) => handleToggle(category, 'email', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            <Label htmlFor={`${category}-sms`} className="text-white cursor-pointer">
              SMS
            </Label>
          </div>
          <Switch
            id={`${category}-sms`}
            checked={prefs[category].sms}
            onCheckedChange={(checked) => handleToggle(category, 'sms', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-gray-400" />
            <Label htmlFor={`${category}-push`} className="text-white cursor-pointer">
              Push Notifications
            </Label>
          </div>
          <Switch
            id={`${category}-push`}
            checked={prefs[category].push}
            onCheckedChange={(checked) => handleToggle(category, 'push', checked)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Choose how you want to receive notifications
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <NotificationSection
          title="Order Updates"
          icon={Bell}
          category="orderUpdates"
          description="Get notified about order status changes, shipping updates, and delivery confirmations"
        />

        <NotificationSection
          title="Promotions & Offers"
          icon={Bell}
          category="promotions"
          description="Receive updates about special deals, discounts, and vendor promotions"
        />

        <NotificationSection
          title="Vendor Messages & Replies"
          icon={MessageSquare}
          category="vendorMessages"
          description="Stay updated when vendors respond to your questions or messages"
        />

        <NotificationSection
          title="Reviews & Ratings"
          icon={Bell}
          category="reviews"
          description="Get notified when someone reviews your purchases or when you receive review requests"
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-netflix-red hover:bg-netflix-red/90 text-white"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}

