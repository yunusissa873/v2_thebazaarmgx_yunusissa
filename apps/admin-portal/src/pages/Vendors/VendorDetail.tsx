import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVendor, approveVendor, rejectVendor, suspendVendor } from '@thebazaar/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@thebazaar/ui/card';
import { Button } from '@thebazaar/ui/button';
import { Badge } from '@thebazaar/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@thebazaar/utils';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, XCircle, Ban } from 'lucide-react';

export default function VendorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: vendorData, isLoading } = useQuery({
    queryKey: ['vendor', id],
    queryFn: () => getVendor(id!),
    enabled: !!id,
  });

  const vendor = vendorData?.data;

  const approveMutation = useMutation({
    mutationFn: (notes?: string) => approveVendor(id!, user?.id || '', notes),
    onSuccess: () => {
      toast.success('Vendor approved successfully');
      queryClient.invalidateQueries({ queryKey: ['vendor', id] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve vendor');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => rejectVendor(id!, user?.id || '', reason),
    onSuccess: () => {
      toast.success('Vendor rejected');
      queryClient.invalidateQueries({ queryKey: ['vendor', id] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject vendor');
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (reason: string) => suspendVendor(id!, user?.id || '', reason),
    onSuccess: () => {
      toast.success('Vendor suspended');
      queryClient.invalidateQueries({ queryKey: ['vendor', id] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to suspend vendor');
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!vendor) {
    return <div className="text-center py-8">Vendor not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/vendors')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{vendor.business_name}</h1>
          <p className="text-muted-foreground">Vendor Details & KYC Review</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Business Name</p>
              <p className="font-medium">{vendor.business_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{vendor.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{vendor.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Business Type</p>
              <p className="font-medium">{vendor.business_type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registration Number</p>
              <p className="font-medium">{vendor.business_registration_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tax ID</p>
              <p className="font-medium">{vendor.tax_id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{vendor.address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">City</p>
              <p className="font-medium">{vendor.city || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status & Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Verification Status</p>
              <Badge className={vendor.is_verified ? 'bg-green-500' : 'bg-yellow-500'}>
                {vendor.is_verified ? 'Verified' : 'Not Verified'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">KYC Status</p>
              <Badge className="capitalize">{vendor.kyc_status || 'pending'}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rating</p>
              <p className="font-medium">{vendor.rating || 0} / 5.0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="font-medium">{vendor.total_reviews || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registered</p>
              <p className="font-medium">{formatDate(vendor.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{formatDate(vendor.updated_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {vendor.kyc_documents && (
        <Card>
          <CardHeader>
            <CardTitle>KYC Documents</CardTitle>
            <CardDescription>Review uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(vendor.kyc_documents as Record<string, string>).map(([key, url]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                  <Button variant="outline" size="sm" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      View Document
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {vendor.kyc_status === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Approve or reject vendor application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Vendor
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const reason = prompt('Enter rejection reason:');
                  if (reason) rejectMutation.mutate(reason);
                }}
                disabled={rejectMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Vendor
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const reason = prompt('Enter suspension reason:');
                  if (reason) suspendMutation.mutate(reason);
                }}
                disabled={suspendMutation.isPending}
              >
                <Ban className="h-4 w-4 mr-2" />
                Suspend Vendor
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


