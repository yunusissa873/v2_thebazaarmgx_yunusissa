import { useState } from 'react';
import { Star, X, Upload } from 'lucide-react';
import { Button } from '@thebazaar/ui/button';
import { Input } from '@thebazaar/ui/input';
import { Label } from '@thebazaar/ui/label';
import { Textarea } from '@thebazaar/ui/textarea';
import { useCreateReview } from '@thebazaar/hooks/useSupabaseReviews';
import { toast } from 'sonner';
import type { CreateReviewData } from '@thebazaar/supabase/reviews';

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ productId, orderId, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const { submitReview, loading } = useCreateReview();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error('You can upload a maximum of 5 images');
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
        setImageFiles((prev) => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    // TODO: Upload images to Supabase Storage and get URLs
    // For now, we'll use base64 data URLs (not recommended for production)
    const reviewData: CreateReviewData = {
      product_id: productId,
      order_id: orderId,
      rating,
      title: title.trim() || undefined,
      comment: comment.trim(),
      images: images.length > 0 ? images : undefined,
    };

    const { data, error } = await submitReview(reviewData);

    if (error) {
      toast.error(error.message || 'Failed to submit review');
      return;
    }

    toast.success('Review submitted successfully!');
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div>
        <Label className="text-white mb-2 block">Rating *</Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-600'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-gray-400 ml-2">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="review-title" className="text-white">
          Review Title (Optional)
        </Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          className="bg-netflix-dark-gray border-netflix-medium-gray text-white mt-2"
          maxLength={100}
        />
      </div>

      {/* Comment */}
      <div>
        <Label htmlFor="review-comment" className="text-white">
          Your Review *
        </Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          className="bg-netflix-dark-gray border-netflix-medium-gray text-white mt-2 min-h-[120px]"
          maxLength={1000}
        />
        <p className="text-gray-400 text-sm mt-1">{comment.length}/1000 characters</p>
      </div>

      {/* Images */}
      <div>
        <Label className="text-white mb-2 block">Photos (Optional, max 5)</Label>
        <div className="space-y-4">
          {images.length > 0 && (
            <div className="grid grid-cols-5 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Review ${index + 1}`}
                    className="w-full h-24 object-cover rounded border border-netflix-medium-gray"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {images.length < 5 && (
            <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-netflix-medium-gray rounded cursor-pointer hover:border-netflix-red transition-colors">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="text-gray-400 text-sm">Upload Image</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          type="submit"
          className="flex-1 bg-netflix-red hover:bg-netflix-red/90 text-white"
          disabled={loading || rating === 0 || !comment.trim()}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

