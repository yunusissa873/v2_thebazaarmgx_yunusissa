/**
 * Vendor Financials Page
 * 
 * Payments, payouts, and financial management
 * 
 * @author The Bazaar Development Team
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VendorFinancials() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Financials</h1>
        <p className="text-gray-400">Manage your earnings and payouts</p>
      </div>

      <Card className="bg-[#1F1F1F] border-[#2F2F2F]">
        <CardHeader>
          <CardTitle>Earnings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Financial dashboard coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
