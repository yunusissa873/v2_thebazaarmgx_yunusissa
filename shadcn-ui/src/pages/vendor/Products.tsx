/**
 * Vendor Products Page
 * 
 * Product management with CRUD operations
 * 
 * @author The Bazaar Development Team
 */

import { useState, useEffect } from 'react';
import { useVendorProfile } from '@/hooks/useVendorProfile';
import { getVendorProducts } from '@/lib/supabase/vendor/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VendorProducts() {
  const { vendorProfile } = useVendorProfile();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadProducts() {
      if (!vendorProfile?.id) return;

      setLoading(true);
      try {
        const result = await getVendorProducts({
          vendorId: vendorProfile.id,
          filters: { search },
          page,
          limit: 20,
        });
        setProducts(result.data || []);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [vendorProfile, search, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-gray-400">Manage your product catalog</p>
        </div>
        <Link to="/vendor/products/add">
          <Button className="bg-[#E50914] hover:bg-[#c11119]">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="bg-[#1F1F1F] border-[#2F2F2F]">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#141414] border-[#2F2F2F] text-white"
              />
            </div>
            <Button variant="outline" className="border-[#2F2F2F]">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-[#1F1F1F] border-[#2F2F2F]">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-48 bg-[#2F2F2F] rounded" />
                  <div className="h-4 bg-[#2F2F2F] rounded w-3/4" />
                  <div className="h-4 bg-[#2F2F2F] rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="bg-[#1F1F1F] border-[#2F2F2F] hover:border-[#E50914] transition-colors">
              <CardHeader>
                <div className="aspect-video bg-[#141414] rounded-lg mb-4 flex items-center justify-center">
                  {product.images && product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <Package className="h-12 w-12 text-gray-600" />
                  )}
                </div>
                <CardTitle className="line-clamp-2">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold">KES {parseFloat(product.price?.toString() || '0').toLocaleString()}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    product.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                  }`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  Stock: {product.stock_quantity || 0}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-[#2F2F2F]">Edit</Button>
                  <Button variant="outline" className="flex-1 border-[#2F2F2F]">View</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-[#1F1F1F] border-[#2F2F2F]">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No products found</p>
            <Link to="/vendor/products/add">
              <Button className="bg-[#E50914] hover:bg-[#c11119]">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
