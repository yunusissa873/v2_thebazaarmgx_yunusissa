import { Link } from 'react-router-dom';
import { Star, MapPin, BadgeCheck } from 'lucide-react';
import { Badge } from '@thebazaar/ui/badge';
import { Button } from '@thebazaar/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@thebazaar/ui/avatar';
import { cn } from '@thebazaar/utils';
import type { MockVendor } from '@/data/mockVendors';

interface VendorCardProps extends Partial<MockVendor> {
  className?: string;
}

const tierColors = {
  Basic: 'bg-gray-500',
  Bronze: 'bg-orange-700',
  Silver: 'bg-gray-400',
  Gold: 'bg-yellow-500',
  Platinum: 'bg-purple-500',
};

export function VendorCard({
  slug = '',
  name = '',
  businessType = '',
  logo = '',
  banner = '',
  rating = 0,
  reviewCount = 0,
  city = '',
  country = '',
  subscriptionTier = 'Basic',
  isVerified = false,
  className,
}: VendorCardProps) {
  return (
    <Link to={`/vendors/${slug}`}>
      <div
        className={cn(
          'group relative overflow-hidden rounded-lg bg-netflix-dark-gray transition-all duration-300 ease-in-out netflix-card',
          className
        )}
      >
        {/* Banner Image */}
        <div className="relative h-32 overflow-hidden">
          <img
            src={banner || '/placeholder-banner.jpg'}
            alt={`${name} banner`}
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-banner.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />

          {/* Subscription Tier Badge */}
          <Badge
            className={cn(
              'absolute top-2 right-2 text-white border-none',
              tierColors[subscriptionTier]
            )}
          >
            {subscriptionTier}
          </Badge>

          {/* Verified Badge */}
          {isVerified && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              <BadgeCheck className="h-3 w-3" />
              <span>Verified</span>
            </div>
          )}
        </div>

        {/* Vendor Logo - Overlapping banner */}
        <div className="relative -mt-12 px-4">
          <Avatar className="h-20 w-20 border-4 border-netflix-dark-gray">
            <AvatarImage 
              src={logo} 
              alt={name}
              onError={(e) => {
                e.currentTarget.src = '';
              }}
            />
            <AvatarFallback className="bg-netflix-medium-gray text-white text-xl">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Vendor Info */}
        <div className="p-4 pt-2">
          <h3 className="text-white font-semibold text-lg line-clamp-1 mb-1">
            {name}
          </h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-1">
            {businessType}
          </p>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3.5 w-3.5',
                      i < Math.floor(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-600'
                    )}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm">
                {rating.toFixed(1)} ({reviewCount})
              </span>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-1 text-gray-400 text-sm mb-4">
            <MapPin className="h-4 w-4" />
            <span>
              {city}, {country}
            </span>
          </div>

          {/* View Profile Button */}
          <Button
            className="w-full bg-netflix-red hover:bg-netflix-red/90 text-white"
            size="sm"
          >
            View Profile
          </Button>
        </div>
      </div>
    </Link>
  );
}