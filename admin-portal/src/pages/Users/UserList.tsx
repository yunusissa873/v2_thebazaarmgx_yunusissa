import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Search, User as UserIcon, Shield, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { UserFilters } from '@/types/admin';

export default function UserList() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<UserFilters>({});
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, filters],
    queryFn: () => getUsers(filters, page, 20),
  });

  const handleSearch = () => {
    setFilters({ ...filters, search });
    setPage(1);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'vendor':
        return <Store className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-500',
      vendor: 'bg-blue-500',
      buyer: 'bg-gray-500',
    };
    return <Badge className={colors[role] || 'bg-gray-500'}>{role}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage all platform users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
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
              value={filters.role || ''}
              onChange={(e) => setFilters({ ...filters, role: e.target.value as any })}
            >
              <option value="">All Roles</option>
              <option value="buyer">Buyers</option>
              <option value="vendor">Vendors</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {data?.count || 0} total users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {data?.data?.map((user: any) => (
                <Link
                  key={user.id}
                  to={`/users/${user.id}`}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{user.full_name || 'No Name'}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.phone && (
                          <p className="text-sm text-muted-foreground">{user.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Registered</p>
                      <p className="text-sm">{formatDate(user.created_at)}</p>
                      {user.is_verified ? (
                        <Badge className="bg-green-500 mt-2">Verified</Badge>
                      ) : (
                        <Badge variant="outline" className="mt-2">Not Verified</Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {(!data?.data || data.data.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


