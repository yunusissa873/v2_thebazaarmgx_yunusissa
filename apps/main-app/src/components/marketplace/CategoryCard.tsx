import { Link } from 'react-router-dom';
import { cn } from '@thebazaar/utils';

interface CategoryCardProps {
  category_id: string;
  name: string;
  slug: string;
  image_url: string;
  is_featured?: boolean;
  level?: number;
}

export function CategoryCard({
  category_id,
  name,
  slug,
  image_url,
  is_featured = false,
  level = 1,
}: CategoryCardProps) {
  return (
    <Link
      to={`/products?category=${category_id}`}
      className={cn(
        'group relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
        'hover:scale-105 hover:shadow-lg hover:border-netflix-red',
        is_featured
          ? 'border-netflix-red ring-2 ring-netflix-red'
          : 'border-netflix-medium-gray'
      )}
    >
      <img
        src={image_url}
        alt={name}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&q=80';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <p className="text-white text-xs font-medium text-center line-clamp-2">
          {name}
        </p>
      </div>
      {is_featured && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-netflix-red rounded-full" />
      )}
    </Link>
  );
}

