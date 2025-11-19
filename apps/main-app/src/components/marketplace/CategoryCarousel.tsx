import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@thebazaar/ui/button';
import { ScrollArea, ScrollBar } from '@thebazaar/ui/scroll-area';
import { cn } from '@thebazaar/utils';

interface Category {
  id?: string;
  category_id?: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  image_url?: string;
}

interface CategoryCarouselProps {
  categories: Category[];
  activeCategory?: string;
  onCategoryClick?: (categorySlug: string) => void;
  className?: string;
}

export function CategoryCarousel({
  categories,
  activeCategory,
  onCategoryClick,
  className,
}: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        direction === 'left'
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <div className={cn('relative group', className)}>
      {/* Left Arrow */}
      {showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/70 text-white hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}

      {/* Categories Scroll Area */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 py-4"
        >
          {categories.map((category) => (
            <button
              key={category.id || category.category_id || category.slug}
              onClick={() => onCategoryClick?.(category.slug)}
              className={cn(
                'flex-shrink-0 group/item relative overflow-hidden rounded-lg transition-all duration-300',
                'w-32 h-32 md:w-40 md:h-40',
                activeCategory === category.slug
                  ? 'ring-2 ring-netflix-red scale-105'
                  : 'hover:scale-105'
              )}
            >
              {/* Category Image/Icon */}
              <div className="relative h-full w-full">
                {(category.image || category.image_url) ? (
                  <img
                    src={category.image || category.image_url}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover/item:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&q=80';
                    }}
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-netflix-red/20 to-netflix-red/5 flex items-center justify-center">
                    {category.icon ? (
                      <span className="text-4xl">{category.icon}</span>
                    ) : (
                      <span className="text-4xl text-netflix-red">
                        {category.name.charAt(0)}
                      </span>
                    )}
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Category Name */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-semibold text-sm text-center line-clamp-2">
                    {category.name}
                  </p>
                </div>

                {/* Active Indicator */}
                {activeCategory === category.slug && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-netflix-red" />
                )}
              </div>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>

      {/* Right Arrow */}
      {showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/70 text-white hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}