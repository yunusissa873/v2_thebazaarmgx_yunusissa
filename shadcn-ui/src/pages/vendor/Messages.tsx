/**
 * Vendor Messages Page
 * 
 * Customer messaging interface
 * 
 * @author The Bazaar Development Team
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VendorMessages() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-gray-400">Communicate with your customers</p>
      </div>

      <Card className="bg-[#1F1F1F] border-[#2F2F2F]">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Messaging interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
