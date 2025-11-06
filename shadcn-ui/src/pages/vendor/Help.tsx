/**
 * Vendor Help Page
 * 
 * Help center and support resources
 * 
 * @author The Bazaar Development Team
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VendorHelp() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-gray-400">Find answers and get support</p>
      </div>

      <Card className="bg-[#1F1F1F] border-[#2F2F2F]">
        <CardHeader>
          <CardTitle>Support Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Help center coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
