import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { VendorProfile } from '@/components/vendor/VendorProfile';
import { VendorCard } from '@/components/vendor/VendorCard';
import { mockVendors } from '@/data/mockVendors';
import { mockProducts } from '@/data/mockProducts';

export default function VendorProfilePage() {
  const { slug } = useParams<{ slug: string }>();

  // Find vendor by slug
  const vendor = mockVendors.find((v) => v.slug === slug);

  if (!vendor) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Vendor Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            The vendor you're looking for doesn't exist.
          </p>
          <Link
            to="/vendors"
            className="text-netflix-red hover:underline text-lg"
          >
            Browse All Vendors
          </Link>
        </div>
      </div>
    );
  }

  // Get vendor's products (mock data - filter by vendor name)
  const vendorProducts = mockProducts
    .filter((p) => p.vendorSlug === vendor.slug)
    .slice(0, 10); // Limit to 10 products

  // Get related vendors (same business type, excluding current vendor)
  const relatedVendors = mockVendors
    .filter(
      (v) =>
        v.id !== vendor.id &&
        v.businessType.toLowerCase().includes(vendor.businessType.toLowerCase())
    )
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Breadcrumb Navigation */}
      <div className="bg-netflix-dark-gray border-b border-netflix-medium-gray">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-600" />
            <Link
              to="/vendors"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Vendors
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-600" />
            <span className="text-white">{vendor.name}</span>
          </nav>
        </div>
      </div>

      {/* Vendor Profile */}
      <VendorProfile vendor={vendor} products={vendorProducts} />

      {/* Related Vendors Section */}
      {relatedVendors.length > 0 && (
        <div className="bg-netflix-dark-gray/50 py-12">
          <div className="container-custom">
            <h2 className="text-2xl font-bold text-white mb-6">
              Similar Vendors
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {relatedVendors.map((relatedVendor) => (
                <VendorCard key={relatedVendor.id} {...relatedVendor} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}