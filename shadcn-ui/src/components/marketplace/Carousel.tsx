import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CarouselItem {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  cta?: {
    text: string;
    link: string;
  };
}

interface CarouselProps {
  items: CarouselItem[];
  autoPlayInterval?: number;
  className?: string;
}

export function Carousel({
  items,
  autoPlayInterval = 5000,
  className,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  }, [items.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  }, [items.length]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPaused && autoPlayInterval > 0) {
      const interval = setInterval(goToNext, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [isPaused, autoPlayInterval, goToNext]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn('relative w-full overflow-hidden group', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Items */}
      <div className="relative aspect-video md:aspect-[21/9] w-full">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-in-out',
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            )}
          >
            <img
              src={item.image}
              alt={item.title || `Slide ${index + 1}`}
              className="h-full w-full object-cover"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content Overlay */}
            {(item.title || item.subtitle || item.cta) && (
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <div className="max-w-2xl">
                  {item.title && (
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 animate-slide-in">
                      {item.title}
                    </h2>
                  )}
                  {item.subtitle && (
                    <p className="text-lg md:text-xl text-gray-200 mb-4 animate-slide-in delay-100">
                      {item.subtitle}
                    </p>
                  )}
                  {item.cta && (
                    <Button
                      className="bg-netflix-red hover:bg-netflix-red/90 text-white animate-slide-in delay-200"
                      onClick={() => (window.location.href = item.cta!.link)}
                    >
                      {item.cta.text}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 transition-opacity duration-300',
          'opacity-0 group-hover:opacity-100'
        )}
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 transition-opacity duration-300',
          'opacity-0 group-hover:opacity-100'
        )}
        onClick={goToNext}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              index === currentIndex
                ? 'w-8 bg-netflix-red'
                : 'w-2 bg-white/50 hover:bg-white/75'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}