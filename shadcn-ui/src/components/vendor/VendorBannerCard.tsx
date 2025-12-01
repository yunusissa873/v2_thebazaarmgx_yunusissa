import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, BadgeCheck, UserPlus, UserCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { MockVendor } from '@/data/mockVendors';

interface VendorBannerCardProps {
  vendor: MockVendor;
  className?: string;
}

const tierColors = {
  Basic: 'bg-gray-500',
  Bronze: 'bg-orange-700',
  Silver: 'bg-gray-400',
  Gold: 'bg-yellow-500',
  Platinum: 'bg-purple-500',
};

export function VendorBannerCard({
  vendor,
  className,
}: VendorBannerCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    // TODO: Implement follow/unfollow functionality with Supabase
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/vendors/${vendor.slug}`);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if clicking on the card itself, not on buttons
    const target = e.target as HTMLElement;
    if (target.closest('button, a, [role="button"]')) {
      return;
    }
    navigate(`/vendors/${vendor.slug}`);
  };

  return (
    <TooltipProvider>
      <div
        onClick={handleCardClick}
        className={cn(
          'relative w-full h-full min-h-[450px] md:min-h-[500px] overflow-hidden rounded-lg cursor-pointer group',
          className
        )}
      >
        {/* Cover Photo Background */}
        <div className="absolute inset-0">
          <img
            src={vendor.banner || '/placeholder-banner.jpg'}
            alt={`${vendor.name} cover`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-banner.jpg';
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
        </div>

        {/* Content Container */}
        <div className="relative h-full flex flex-col justify-end p-5 md:p-8 lg:p-10">
          <div className="max-w-4xl">
            {/* Logo and Basic Info Row */}
            <div className="flex items-start gap-4 md:gap-5 mb-4 md:mb-5">
              {/* Vendor Logo */}
              <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-white/20 shadow-2xl">
                <AvatarImage
                  src={vendor.logo}
                  alt={vendor.name}
                  onError={(e) => {
                    e.currentTarget.src = '';
                  }}
                />
                <AvatarFallback className="bg-netflix-medium-gray text-white text-2xl md:text-3xl">
                  {vendor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Vendor Name and Badges */}
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                    {vendor.name}
                  </h2>
                  {vendor.isVerified && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                          <BadgeCheck className="h-3 w-3" />
                          <span>Verified</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Verified Vendor</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <Badge
                    className={cn(
                      'text-white border-none text-xs',
                      tierColors[vendor.subscriptionTier]
                    )}
                  >
                    {vendor.subscriptionTier}
                  </Badge>
                </div>

                {/* Business Type and Location */}
                <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
                  <p className="text-gray-300 text-base md:text-lg">
                    {vendor.businessType}
                  </p>
                  <div className="flex items-center gap-1 text-gray-400">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="text-xs md:text-sm">
                      {vendor.city}, {vendor.country}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                {vendor.rating > 0 && (
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-3 w-3 md:h-4 md:w-4',
                            i < Math.floor(vendor.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-600'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-gray-300 text-xs md:text-sm">
                      {vendor.rating.toFixed(1)} ({vendor.reviewCount} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Business Description */}
            {vendor.description && (
              <p className="text-gray-200 text-sm md:text-base mb-4 md:mb-5 line-clamp-2 max-w-3xl">
                {vendor.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 md:gap-4">
              <Button
                onClick={handleViewProfile}
                className="bg-netflix-red hover:bg-netflix-red/90 text-white px-4 py-3 md:px-5 md:py-4 text-sm md:text-base"
                size="default"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </Button>
              <Button
                onClick={handleFollow}
                variant="outline"
                className="border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white px-4 py-3 md:px-5 md:py-4 text-sm md:text-base backdrop-blur-sm"
                size="default"
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
