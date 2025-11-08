import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FolderTree, Plus, Edit, Trash2 } from 'lucide-react';

export default function CategoryManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .order('level', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ categoryId, isActive }: { categoryId: string; isActive: boolean }) => {
      const { error } = await supabaseAdmin
        .from('categories')
        .update({ is_active: isActive })
        .eq('id', categoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Category updated');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update category');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-muted-foreground">Manage product categories and hierarchy</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>{categories?.length || 0} total categories</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-2">
              {categories?.map((category: any) => (
                <div
                  key={category.id}
                  className="p-4 border rounded-lg"
                  style={{ marginLeft: `${(category.level - 1) * 20}px` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FolderTree className="h-5 w-5" />
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Level {category.level} • Slug: {category.slug}
                        </p>
                        {category.path_slug && (
                          <p className="text-xs text-muted-foreground">Path: {category.path_slug}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={category.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toggleActiveMutation.mutate({
                            categoryId: category.id,
                            isActive: !category.is_active,
                          })
                        }
                      >
                        {category.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {(!categories || categories.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">No categories found</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


