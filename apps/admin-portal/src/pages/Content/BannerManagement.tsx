import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAdmin } from '@thebazaar/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@thebazaar/ui/card';
import { Button } from '@thebazaar/ui/button';
import { Badge } from '@thebazaar/ui/badge';
import { formatDate } from '@thebazaar/utils';
import { toast } from 'sonner';
import { Plus, Image, Edit, Trash2 } from 'lucide-react';

export default function BannerManagement() {
  const queryClient = useQueryClient();

  const { data: banners, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('banners')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ bannerId, isActive }: { bannerId: string; isActive: boolean }) => {
      const { error } = await supabaseAdmin
        .from('banners')
        .update({ is_active: isActive })
        .eq('banner_id', bannerId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Banner updated');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update banner');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banner Management</h1>
          <p className="text-muted-foreground">Manage promotional banners</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Banner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Banners</CardTitle>
          <CardDescription>All promotional banners</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {banners?.map((banner: any) => (
                <div key={banner.banner_id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Image className="h-12 w-12 object-cover rounded" src={banner.image_url} alt={banner.title} />
                      <div>
                        <h3 className="font-semibold">{banner.title}</h3>
                        <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
                        <p className="text-xs text-muted-foreground">
                          Priority: {banner.priority} • {formatDate(banner.start_date)} to {formatDate(banner.end_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={banner.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toggleActiveMutation.mutate({
                            bannerId: banner.banner_id,
                            isActive: !banner.is_active,
                          })
                        }
                      >
                        {banner.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {(!banners || banners.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">No banners found</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


