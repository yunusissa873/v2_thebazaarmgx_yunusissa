import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Search, FileText } from 'lucide-react';

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<any>({});
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, filters],
    queryFn: () => getAuditLogs(filters, page, 50),
  });

  const handleSearch = () => {
    setFilters({ ...filters, action: search });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">Complete audit trail of all admin actions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search audit logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by action..."
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
              value={filters.resource_type || ''}
              onChange={(e) => setFilters({ ...filters, resource_type: e.target.value })}
            >
              <option value="">All Resources</option>
              <option value="vendor">Vendors</option>
              <option value="user">Users</option>
              <option value="product">Products</option>
              <option value="order">Orders</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>{data?.count || 0} total log entries</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {data?.data?.map((log: any) => (
                <div key={log.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <p className="font-medium capitalize">{log.action.replace(/_/g, ' ')}</p>
                        <Badge variant="outline">{log.resource_type}</Badge>
                      </div>
                      {log.resource_id && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Resource ID: {log.resource_id}
                        </p>
                      )}
                      {log.changes && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs">
                          <pre>{JSON.stringify(log.changes, null, 2)}</pre>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(log.created_at)} • Admin: {log.admin_id} • IP: {log.ip_address || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {(!data?.data || data.data.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">No audit logs found</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


