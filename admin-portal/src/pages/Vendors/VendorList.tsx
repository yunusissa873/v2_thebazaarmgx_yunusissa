import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVendors } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Search, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { VendorFilters } from '@/types/admin';

export default function VendorList() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<VendorFilters>({});
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['vendors', page, filters],
    queryFn: () => getVendors(filters, page, 20),
  });

  const handleSearch = () => {
    setFilters({ ...filters, search });
    setPage(1);
  };

  const getStatusBadge = (vendor: any) => {
    if (vendor.is_verified && vendor.kyc_status === 'approved') {
      return <Badge className="bg-green-500">Approved</Badge>;
    }
    if (vendor.kyc_status === 'pending') {
      return <Badge className="bg-yellow-500">Pending</Badge>;
    }
    if (vendor.kyc_status === 'rejected') {
      return <Badge className="bg-red-500">Rejected</Badge>;
    }
    return <Badge variant="outline">Suspended</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vendor Management</h1>
        <p className="text-muted-foreground">Manage vendor approvals, KYC, and profiles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <select
              className="px-4 py-2 border rounded-md"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendors</CardTitle>
          <CardDescription>
            {data?.count || 0} total vendors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {data?.data?.map((vendor: any) => (
                <Link
                  key={vendor.id}
                  to={`/vendors/${vendor.id}`}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{vendor.business_name}</h3>
                        {getStatusBadge(vendor)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {vendor.email} • {vendor.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Registered: {formatDate(vendor.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">KYC Status</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {vendor.kyc_status || 'pending'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              {(!data?.data || data.data.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No vendors found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


