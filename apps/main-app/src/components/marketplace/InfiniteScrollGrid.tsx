import { useState, useEffect, useRef, useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@thebazaar/ui/skeleton';
import type { ProductCardData } from '@/utils/productMapper';
import { cn } from '@thebazaar/utils';

interface InfiniteScrollGridProps {
  products: ProductCardData[];
  pageSize?: number;
  className?: string;
}

export function InfiniteScrollGrid({
  products,
  pageSize = 20,
  className,
}: InfiniteScrollGridProps) {
  const [displayedCount, setDisplayedCount] = useState(pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const displayedProducts = useMemo(
    () => products.slice(0, displayedCount),
    [products, displayedCount]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedCount < products.length && !isLoading) {
          setIsLoading(true);
          // Simulate loading delay
          setTimeout(() => {
            setDisplayedCount((prev) => Math.min(prev + pageSize, products.length));
            setIsLoading(false);
          }, 500);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [displayedCount, products.length, pageSize, isLoading]);

  if (products.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-gray-400">No products available</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(pageSize)].map((_, i) => (
            <Skeleton key={i} className="h-[400px] w-full bg-netflix-dark-gray" />
          ))}
        </div>
      )}

      {/* Observer Target */}
      {displayedCount < products.length && (
        <div ref={observerTarget} className="h-10 flex items-center justify-center">
          {!isLoading && (
            <p className="text-gray-400 text-sm">
              Loading more products...
            </p>
          )}
        </div>
      )}

      {/* End of list */}
      {displayedCount >= products.length && displayedProducts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">
            You've reached the end. Showing all {products.length} products.
          </p>
        </div>
      )}
    </div>
  );
}




