import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUser, updateUser, suspendUser } from '@thebazaar/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@thebazaar/ui/card';
import { Button } from '@thebazaar/ui/button';
import { Badge } from '@thebazaar/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@thebazaar/utils';
import { toast } from 'sonner';
import { ArrowLeft, Ban, Shield } from 'lucide-react';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: adminUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id!),
    enabled: !!id,
  });

  const user = userData?.data;

  const suspendMutation = useMutation({
    mutationFn: (reason: string) => suspendUser(id!, adminUser?.id || '', reason),
    onSuccess: () => {
      toast.success('User suspended');
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to suspend user');
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center py-8">User not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{user.full_name || user.email}</h1>
          <p className="text-muted-foreground">User Details & Management</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{user.full_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{user.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge className="capitalize">{user.role}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verification Status</p>
              <Badge className={user.is_verified ? 'bg-green-500' : 'bg-yellow-500'}>
                {user.is_verified ? 'Verified' : 'Not Verified'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registered</p>
              <p className="font-medium">{formatDate(user.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{formatDate(user.updated_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Manage user account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const role = prompt('Enter new role (buyer/vendor/admin):');
                if (role && ['buyer', 'vendor', 'admin'].includes(role)) {
                  updateUser(id!, { role }, adminUser?.id || '').then(() => {
                    toast.success('Role updated');
                    queryClient.invalidateQueries({ queryKey: ['user', id] });
                  });
                }
              }}
            >
              <Shield className="h-4 w-4 mr-2" />
              Change Role
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                const reason = prompt('Enter suspension reason:');
                if (reason) suspendMutation.mutate(reason);
              }}
              disabled={suspendMutation.isPending}
            >
              <Ban className="h-4 w-4 mr-2" />
              Suspend User
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


