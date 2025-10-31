import { useState, useEffect, useCallback, useRef } from 'react';
import type { MockVendor } from '@/data/mockVendors';

interface UseInfiniteVendorsOptions {
  initialVendors?: MockVendor[];
  pageSize?: number;
  filters?: {
    category?: string;
    location?: string;
    rating?: number;
    tier?: string;
    search?: string;
  };
}

interface UseInfiniteVendorsReturn {
  vendors: MockVendor[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  observerTarget: React.RefObject<HTMLDivElement>;
}

export function useInfiniteVendors({
  initialVendors = [],
  pageSize = 20,
  filters = {},
}: UseInfiniteVendorsOptions = {}): UseInfiniteVendorsReturn {
  const [vendors, setVendors] = useState<MockVendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Filter vendors based on criteria
  const filterVendors = useCallback(
    (vendorList: MockVendor[]) => {
      let filtered = [...vendorList];

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.name.toLowerCase().includes(searchLower) ||
            v.businessType.toLowerCase().includes(searchLower) ||
            v.city.toLowerCase().includes(searchLower)
        );
      }

      if (filters.category) {
        filtered = filtered.filter((v) =>
          v.categories.some((cat) =>
            cat.toLowerCase().includes(filters.category!.toLowerCase())
          )
        );
      }

      if (filters.location) {
        filtered = filtered.filter((v) =>
          v.city.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      if (filters.rating) {
        filtered = filtered.filter((v) => v.rating >= filters.rating!);
      }

      if (filters.tier) {
        filtered = filtered.filter((v) => v.subscriptionTier === filters.tier);
      }

      return filtered;
    },
    [filters]
  );

  // Load more vendors
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    // Simulate API call delay
    setTimeout(() => {
      try {
        const filteredVendors = filterVendors(initialVendors);
        const start = page * pageSize;
        const end = start + pageSize;
        const newVendors = filteredVendors.slice(start, end);

        if (newVendors.length === 0 || end >= filteredVendors.length) {
          setHasMore(false);
        }

        setVendors((prev) => [...prev, ...newVendors]);
        setPage((prev) => prev + 1);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, [loading, hasMore, page, pageSize, initialVendors, filterVendors]);

  // Reset when filters change
  useEffect(() => {
    setVendors([]);
    setPage(0);
    setHasMore(true);
  }, [filters.search, filters.category, filters.location, filters.rating, filters.tier]);

  // Load initial data or data after filter change
  useEffect(() => {
    if (page === 0 && hasMore) {
      loadMore();
    }
  }, [page, hasMore, loadMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
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
  }, [hasMore, loading, loadMore]);

  return {
    vendors,
    loading,
    error,
    hasMore,
    loadMore,
    observerTarget,
  };
}