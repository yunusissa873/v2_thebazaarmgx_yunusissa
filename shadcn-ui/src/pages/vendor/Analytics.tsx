/**
 * Vendor Analytics Page
 * 
 * Analytics and reporting dashboard
 * 
 * @author The Bazaar Development Team
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VendorAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-gray-400">Track your sales performance</p>
      </div>

      <Card className="bg-[#1F1F1F] border-[#2F2F2F]">
        <CardHeader>
          <CardTitle>Sales Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Analytics charts coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
