import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VendorCard } from './VendorCard';
import type { MockVendor } from '@/data/mockVendors';
import { cn } from '@/lib/utils';

interface VendorGridCarouselProps {
  vendors: MockVendor[];
  title?: string;
  rows?: number;
  itemsPerRow?: number;
  autoPlayInterval?: number;
  showNavigation?: boolean;
  className?: string;
}

export function VendorGridCarousel({
  vendors,
  title,
  rows = 2,
  itemsPerRow = 15,
  autoPlayInterval = 6000,
  showNavigation = true,
  className,
}: VendorGridCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      return () => container.removeEventListener('scroll', checkScrollability);
    }
  }, [vendors]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isPaused && autoPlayInterval > 0 && scrollContainerRef.current) {
      const interval = setInterval(() => {
        if (scrollContainerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
          const nextScroll = scrollLeft + clientWidth * 0.8;
          
          if (nextScroll >= scrollWidth - 100) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollContainerRef.current.scrollBy({ left: clientWidth * 0.8, behavior: 'smooth' });
          }
          checkScrollability();
        }
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [isPaused, autoPlayInterval]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScrollability, 300);
  };

  if (vendors.length === 0) {
    return null;
  }

  // Split vendors into rows
  const vendorsPerRowCount = Math.ceil(vendors.length / rows);
  const vendorRows: MockVendor[][] = [];
  for (let i = 0; i < rows; i++) {
    vendorRows.push(vendors.slice(i * vendorsPerRowCount, (i + 1) * vendorsPerRowCount));
  }

  return (
    <div className={cn('relative', className)}>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <a href="/vendors" className="text-netflix-red hover:underline text-sm">
            View All
          </a>
        </div>
      )}

      <div className="relative">
        {/* Navigation Buttons */}
        {showNavigation && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-netflix-black/80 border border-netflix-medium-gray text-white hover:bg-netflix-red hover:border-netflix-red',
                !canScrollLeft && 'opacity-0 cursor-not-allowed'
              )}
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-netflix-black/80 border border-netflix-medium-gray text-white hover:bg-netflix-red hover:border-netflix-red',
                !canScrollRight && 'opacity-0 cursor-not-allowed'
              )}
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Scrollable Container with Grid Rows */}
        <div
          ref={scrollContainerRef}
          className="flex flex-col gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {vendorRows.map((rowVendors, rowIndex) => (
            <div
              key={rowIndex}
              className="flex gap-4 flex-shrink-0"
              style={{ width: 'max-content' }}
            >
              {rowVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px]"
                >
                  <VendorCard vendor={vendor} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}




