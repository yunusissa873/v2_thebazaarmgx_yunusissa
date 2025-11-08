import { supabase } from './client';

export interface Review {
  id: string;
  product_id: string;
  buyer_id: string;
  order_id?: string | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
  images?: string[] | null;
  is_verified_purchase: boolean;
  helpful_count: number;
  is_approved: boolean;
  vendor_response?: string | null;
  vendor_responded_at?: string | null;
  created_at: string;
  updated_at: string;
  buyer?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  } | null;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface CreateReviewData {
  product_id: string;
  order_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

/**
 * Get reviews for a product
 */
export async function getProductReviews(
  productId: string,
  limit?: number
): Promise<{ data: Review[] | null; error: any }> {
  try {
    let query = supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error || !data) {
      return { data: null, error };
    }

    // Fetch buyer profiles separately
    const buyerIds = [...new Set(data.map(r => r.buyer_id).filter(Boolean))];
    let buyers: any[] = [];
    if (buyerIds.length > 0) {
      const { data: buyersData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', buyerIds);
      buyers = buyersData || [];
    }

    // Transform images from JSONB to array and add buyer data
    const transformedData = data.map(review => ({
      ...review,
      buyer: buyers.find(b => b.id === review.buyer_id) || null,
      images: Array.isArray(review.images) ? review.images : (review.images ? [review.images] : []),
    }));

    return { data: transformedData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get review statistics for a product
 */
export async function getReviewStats(productId: string): Promise<{ data: ReviewStats | null; error: any }> {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('is_approved', true);

    if (error || !reviews) {
      return { data: null, error };
    }

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    return {
      data: {
        average_rating: Math.round(averageRating * 100) / 100,
        total_reviews: totalReviews,
        rating_distribution: ratingDistribution,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get reviews by user
 */
export async function getUserReviews(userId: string): Promise<{ data: Review[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        buyer:profiles(id, full_name, avatar_url)
      `)
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });

    // Transform images from JSONB to array
    const transformedData = data?.map(review => ({
      ...review,
      images: Array.isArray(review.images) ? review.images : (review.images ? [review.images] : []),
    })) || null;

    return { data: transformedData, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Create a new review
 */
export async function createReview(data: CreateReviewData): Promise<{ data: Review | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // Check if user has already reviewed this product
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', data.product_id)
      .eq('buyer_id', user.id)
      .single();

    if (existingReview) {
      return { data: null, error: { message: 'You have already reviewed this product' } };
    }

    // Check if order_id is provided and verify purchase
    let isVerifiedPurchase = false;
    if (data.order_id) {
      const { data: order } = await supabase
        .from('orders')
        .select('id, buyer_id, status')
        .eq('id', data.order_id)
        .eq('buyer_id', user.id)
        .single();

      if (order && order.status !== 'cancelled') {
        // Check if order contains this product
        const { data: orderItem } = await supabase
          .from('order_items')
          .select('id')
          .eq('order_id', data.order_id)
          .eq('product_id', data.product_id)
          .single();

        isVerifiedPurchase = !!orderItem;
      }
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        product_id: data.product_id,
        buyer_id: user.id,
        order_id: data.order_id || null,
        rating: data.rating,
        title: data.title || null,
        comment: data.comment || null,
        images: data.images || null,
        is_verified_purchase: isVerifiedPurchase,
        is_approved: true, // Auto-approve for now, can add moderation later
      })
      .select(`
        *,
        buyer:profiles(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      return { data: null, error };
    }

    // Update product rating and review count
    await updateProductRating(data.product_id);

    // Transform images from JSONB to array
    const transformedData = {
      ...review,
      images: Array.isArray(review.images) ? review.images : (review.images ? [review.images] : []),
    };

    return { data: transformedData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Update a review
 */
export async function updateReview(
  reviewId: string,
  data: Partial<CreateReviewData>
): Promise<{ data: Review | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // Verify review belongs to user
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('product_id, buyer_id')
      .eq('id', reviewId)
      .eq('buyer_id', user.id)
      .single();

    if (!existingReview) {
      return { data: null, error: { message: 'Review not found or unauthorized' } };
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.comment !== undefined) updateData.comment = data.comment;
    if (data.images !== undefined) updateData.images = data.images;

    const { data: review, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select(`
        *,
        buyer:profiles(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      return { data: null, error };
    }

    // Update product rating
    await updateProductRating(existingReview.product_id);

    // Transform images from JSONB to array
    const transformedData = {
      ...review,
      images: Array.isArray(review.images) ? review.images : (review.images ? [review.images] : []),
    };

    return { data: transformedData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string): Promise<{ error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: { message: 'User not authenticated' } };
    }

    // Get product_id before deleting
    const { data: review } = await supabase
      .from('reviews')
      .select('product_id')
      .eq('id', reviewId)
      .eq('buyer_id', user.id)
      .single();

    if (!review) {
      return { error: { message: 'Review not found or unauthorized' } };
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('buyer_id', user.id);

    if (error) {
      return { error };
    }

    // Update product rating
    await updateProductRating(review.product_id);

    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * Mark review as helpful
 */
export async function markReviewHelpful(reviewId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase.rpc('increment_review_helpful', { review_id: reviewId });
    
    // If RPC doesn't exist, manually update
    if (error && error.code === '42883') {
      const { data: review } = await supabase
        .from('reviews')
        .select('helpful_count')
        .eq('id', reviewId)
        .single();

      if (review) {
        const { error: updateError } = await supabase
          .from('reviews')
          .update({ helpful_count: review.helpful_count + 1 })
          .eq('id', reviewId);

        return { error: updateError };
      }
    }

    return { error };
  } catch (error) {
    return { error };
  }
}

/**
 * Update product rating and review count (helper function)
 */
async function updateProductRating(productId: string): Promise<void> {
  try {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('is_approved', true);

    if (!reviews || reviews.length === 0) {
      await supabase
        .from('products')
        .update({
          rating: 0,
          review_count: 0,
        })
        .eq('id', productId);
      return;
    }

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const reviewCount = reviews.length;

    await supabase
      .from('products')
      .update({
        rating: Math.round(averageRating * 100) / 100,
        review_count: reviewCount,
      })
      .eq('id', productId);
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}

