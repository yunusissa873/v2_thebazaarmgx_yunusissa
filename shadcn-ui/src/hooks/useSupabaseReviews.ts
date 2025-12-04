import { useState, useEffect } from 'react';
import {
  getProductReviews,
  getReviewStats,
  createReview,
  updateReview,
  deleteReview,
  type Review,
  type ReviewStats,
  type CreateReviewData,
} from '@/lib/supabase/reviews';
import { useProductReviews as useMockReviews } from '@/hooks/useMockData';

/**
 * Hook to fetch reviews for a product
 */
export function useSupabaseProductReviews(productId: string, limit?: number) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Fallback to mock data
  const mockReviews = useMockReviews(productId);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await getProductReviews(productId, limit);

        if (fetchError) {
          console.warn('Supabase fetch error, using mock data:', fetchError);
          setReviews(mockReviews as any);
        } else {
          setReviews(data || []);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(err);
        setReviews(mockReviews as any);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, limit]);

  return { reviews, loading, error };
}

/**
 * Hook to fetch review statistics for a product
 */
export function useSupabaseReviewStats(productId: string) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await getReviewStats(productId);

        if (fetchError) {
          console.warn('Supabase fetch error:', fetchError);
          setError(fetchError);
        } else {
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching review stats:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [productId]);

  return { stats, loading, error };
}

/**
 * Hook to create a review
 */
export function useCreateReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const submitReview = async (data: CreateReviewData) => {
    setLoading(true);
    setError(null);

    try {
      const { data: review, error: createError } = await createReview(data);

      if (createError) {
        setError(createError);
        return { data: null, error: createError };
      }

      return { data: review, error: null };
    } catch (err) {
      setError(err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { submitReview, loading, error };
}

/**
 * Hook to update a review
 */
export function useUpdateReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const update = async (reviewId: string, data: Partial<CreateReviewData>) => {
    setLoading(true);
    setError(null);

    try {
      const { data: review, error: updateError } = await updateReview(reviewId, data);

      if (updateError) {
        setError(updateError);
        return { data: null, error: updateError };
      }

      return { data: review, error: null };
    } catch (err) {
      setError(err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

/**
 * Hook to delete a review
 */
export function useDeleteReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const remove = async (reviewId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await deleteReview(reviewId);

      if (deleteError) {
        setError(deleteError);
        return { error: deleteError };
      }

      return { error: null };
    } catch (err) {
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading, error };
}

