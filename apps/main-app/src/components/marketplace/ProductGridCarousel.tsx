import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@thebazaar/ui/button';
import { ProductCard } from './ProductCard';
import type { ProductCardData } from '@/utils/productMapper';
import { cn } from '@thebazaar/utils';

interface ProductGridCarouselProps {
  products: ProductCardData[];
  title?: string;
  rows?: number;
  itemsPerRow?: number;
  autoPlayInterval?: number;
  showNavigation?: boolean;
  className?: string;
}

export function ProductGridCarousel({
  products,
  title,
  rows = 2,
  itemsPerRow = 15,
  autoPlayInterval = 6000,
  showNavigation = true,
  className,
}: ProductGridCarouselProps) {
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
  }, [products]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isPaused && autoPlayInterval > 0 && scrollContainerRef.current) {
      const interval = setInterval(() => {
        if (scrollContainerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
          const nextScroll = scrollLeft + clientWidth * 0.8;
          
          if (nextScroll >= scrollWidth - 100) {
            // Reset to start
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

  if (products.length === 0) {
    return null;
  }

  // Split products into rows
  const productsPerRowCount = Math.ceil(products.length / rows);
  const productRows: ProductCardData[][] = [];
  for (let i = 0; i < rows; i++) {
    productRows.push(products.slice(i * productsPerRowCount, (i + 1) * productsPerRowCount));
  }

  return (
    <div className={cn('relative', className)}>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <a href="/products" className="text-netflix-red hover:underline text-sm">
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
          {productRows.map((rowProducts, rowIndex) => (
            <div
              key={rowIndex}
              className="flex gap-4 flex-shrink-0"
              style={{ width: 'max-content' }}
            >
              {rowProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-[280px]"
                >
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}




