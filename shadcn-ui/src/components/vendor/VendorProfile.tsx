import { useState } from 'react';
import { Star, MapPin, BadgeCheck, Users, Package, Share2, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { cn } from '@/lib/utils';
import type { MockVendor } from '@/data/mockVendors';

interface VendorProfileProps {
  vendor: MockVendor;
  products?: any[];
}

const tierColors = {
  Basic: 'bg-gray-500',
  Bronze: 'bg-orange-700',
  Silver: 'bg-gray-400',
  Gold: 'bg-yellow-500',
  Platinum: 'bg-purple-500',
};

export function VendorProfile({ vendor, products = [] }: VendorProfileProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement follow/unfollow API call
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share vendor profile');
  };

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={vendor.banner}
          alt={`${vendor.name} banner`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-netflix-black" />

        {/* Vendor Logo - Overlapping banner */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container-custom">
            <div className="relative -mb-16 md:-mb-20">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-netflix-black">
                <AvatarImage src={vendor.logo} alt={vendor.name} />
                <AvatarFallback className="bg-netflix-medium-gray text-white text-4xl">
                  {vendor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Info Section */}
      <div className="container-custom pt-20 md:pt-24 pb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {vendor.name}
              </h1>
              {vendor.isVerified && (
                <BadgeCheck className="h-6 w-6 text-blue-500" />
              )}
            </div>

            <p className="text-gray-400 text-lg mb-3">{vendor.businessType}</p>

            <div className="flex items-center gap-4 mb-4">
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < Math.floor(vendor.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-600'
                      )}
                    />
                  ))}
                </div>
                <span className="text-white">
                  {vendor.rating.toFixed(1)} ({vendor.reviewCount} reviews)
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>
                  {vendor.city}, {vendor.country}
                </span>
              </div>
            </div>

            {/* Subscription Tier */}
            <Badge
              className={cn(
                'text-white border-none',
                tierColors[vendor.subscriptionTier]
              )}
            >
              {vendor.subscriptionTier} Tier
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant={isFollowing ? 'outline' : 'default'}
              className={cn(
                isFollowing
                  ? 'border-netflix-red text-netflix-red hover:bg-netflix-red/10'
                  : 'bg-netflix-red hover:bg-netflix-red/90 text-white'
              )}
              onClick={handleFollow}
            >
              <Heart
                className={cn('h-4 w-4 mr-2', isFollowing && 'fill-current')}
              />
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
            <Button
              variant="outline"
              className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mt-8 p-6 bg-netflix-dark-gray rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Package className="h-5 w-5 text-netflix-red" />
              <span className="text-2xl font-bold text-white">
                {vendor.productCount}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Products</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="h-5 w-5 text-netflix-red" />
              <span className="text-2xl font-bold text-white">
                {vendor.followers.toLocaleString()}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Followers</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span className="text-2xl font-bold text-white">
                {vendor.rating.toFixed(1)}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Rating</p>
          </div>
        </div>
      </div>

      <Separator className="bg-netflix-dark-gray" />

      {/* Tabbed Content */}
      <div className="container-custom py-8">
        <Tabs defaultValue="commerce" className="w-full">
          <TabsList className="bg-netflix-dark-gray border-b border-netflix-medium-gray w-full justify-start rounded-none h-auto p-0">
            <TabsTrigger
              value="commerce"
              className="data-[state=active]:bg-transparent data-[state=active]:text-netflix-red data-[state=active]:border-b-2 data-[state=active]:border-netflix-red rounded-none px-6 py-3 text-gray-400"
            >
              Commerce
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-transparent data-[state=active]:text-netflix-red data-[state=active]:border-b-2 data-[state=active]:border-netflix-red rounded-none px-6 py-3 text-gray-400"
            >
              Details
            </TabsTrigger>
          </TabsList>

          {/* Commerce Tab */}
          <TabsContent value="commerce" className="mt-8">
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  No products available yet
                </p>
              </div>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="mt-8">
            <div className="max-w-3xl space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  About
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {vendor.description}
                </p>
              </div>

              <Separator className="bg-netflix-medium-gray" />

              {/* Business Hours */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Business Hours
                </h3>
                <p className="text-gray-300">{vendor.hours}</p>
              </div>

              <Separator className="bg-netflix-medium-gray" />

              {/* Contact Information */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-300">
                    <span className="text-gray-400">Email:</span>{' '}
                    <a
                      href={`mailto:${vendor.contact.email}`}
                      className="text-netflix-red hover:underline"
                    >
                      {vendor.contact.email}
                    </a>
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-400">Phone:</span>{' '}
                    <a
                      href={`tel:${vendor.contact.phone}`}
                      className="text-netflix-red hover:underline"
                    >
                      {vendor.contact.phone}
                    </a>
                  </p>
                  {vendor.contact.website && (
                    <p className="text-gray-300">
                      <span className="text-gray-400">Website:</span>{' '}
                      <a
                        href={vendor.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-netflix-red hover:underline"
                      >
                        {vendor.contact.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <Separator className="bg-netflix-medium-gray" />

              {/* Location Map Placeholder */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Location
                </h3>
                <div className="aspect-video bg-netflix-dark-gray rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">
                      {vendor.city}, {vendor.country}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Map integration coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}