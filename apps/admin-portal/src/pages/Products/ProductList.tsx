import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@thebazaar/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@thebazaar/ui/card';
import { Button } from '@thebazaar/ui/button';
import { Input } from '@thebazaar/ui/input';
import { Badge } from '@thebazaar/ui/badge';
import { formatCurrency, formatDate } from '@thebazaar/utils';
import { Search, Package, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductList() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<any>({});
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, filters],
    queryFn: () => getProducts(filters, page, 20),
  });

  const handleSearch = () => {
    setFilters({ ...filters, search });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Product Management</h1>
        <p className="text-muted-foreground">Moderate products and manage catalog</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
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
              value={filters.is_active === undefined ? '' : filters.is_active ? 'active' : 'inactive'}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  is_active: e.target.value === '' ? undefined : e.target.value === 'active',
                })
              }
            >
              <option value="">All Products</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>{data?.count || 0} total products</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {data?.data?.map((product: any) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Package className="h-5 w-5" />
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(product.price || 0)} • Stock: {product.stock_quantity || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Created: {formatDate(product.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {product.is_active ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {(!data?.data || data.data.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">No products found</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


