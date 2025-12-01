import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminStaff, createStaffAccount, updateStaffPermissions, deactivateStaffAccount, resetStaffPassword } from '@/lib/supabase/adminStaff';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users, Plus, Shield, X } from 'lucide-react';

export default function AdminStaffManagement() {
  const { user, isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'moderator' as 'admin' | 'moderator' | 'support' | 'analyst',
    permissions: [] as string[],
  });

  // Only super admin can access
  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                Only super administrators can manage staff accounts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: staff, isLoading } = useQuery({
    queryKey: ['admin-staff', user?.id],
    queryFn: () => getAdminStaff(user?.id || ''),
    enabled: !!user && isSuperAdmin,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => createStaffAccount(data, user?.id || ''),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error.message || 'Failed to create staff account');
        return;
      }

      toast.success('Staff account created successfully');
      toast.info(`Temporary password: ${result.data?.temporaryPassword}`, {
        duration: 10000,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      setShowCreateForm(false);
      setFormData({ email: '', full_name: '', role: 'moderator', permissions: [] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create staff account');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (staffId: string) => deactivateStaffAccount(staffId, user?.id || ''),
    onSuccess: () => {
      toast.success('Staff account deactivated');
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to deactivate account');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (staffId: string) => resetStaffPassword(staffId, user?.id || ''),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error.message || 'Failed to reset password');
        return;
      }
      toast.success('Password reset successfully');
      toast.info(`New temporary password: ${result.data?.temporaryPassword}`, {
        duration: 10000,
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const availablePermissions = [
    'vendor_management',
    'user_management',
    'product_moderation',
    'order_management',
    'financial_management',
    'content_moderation',
    'analytics_view',
    'settings_management',
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Staff Management</h1>
          <p className="text-muted-foreground">Manage admin team members and permissions</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Staff Account
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Staff Account</CardTitle>
            <CardDescription>Only super admins can create staff accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="staff@thebazaar.com"
                />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <Label>Role</Label>
              <select
                className="w-full p-2 border rounded"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <option value="moderator">Moderator</option>
                <option value="support">Support</option>
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availablePermissions.map((perm) => (
                  <label key={perm} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            permissions: [...formData.permissions, perm],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            permissions: formData.permissions.filter((p) => p !== perm),
                          });
                        }
                      }}
                    />
                    <span className="text-sm">{perm.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                Create Account
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Admin Staff ({staff?.data?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : staff?.data && staff.data.length > 0 ? (
            <div className="space-y-4">
              {staff.data.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{member.full_name}</h3>
                      {member.isSuperAdmin && (
                        <Badge className="bg-red-500">Super Admin</Badge>
                      )}
                      <Badge>{member.role || 'admin'}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <div className="flex gap-1 mt-2">
                      {member.permissions?.slice(0, 3).map((perm: string) => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                      {member.permissions?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetPasswordMutation.mutate(member.id)}
                      disabled={resetPasswordMutation.isPending}
                    >
                      Reset Password
                    </Button>
                    {!member.isSuperAdmin && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deactivateMutation.mutate(member.id)}
                        disabled={deactivateMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No staff members found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


