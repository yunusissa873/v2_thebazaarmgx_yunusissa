/**
 * Categories Page - Browse all categories
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useMockData';
import { CategoryCard } from '@/components/marketplace/CategoryCard';
import type { Category } from '@/data/the_bazaar_categories';

// Helper to flatten all categories from nested structure
function flattenAllCategories(categories: Category[]): Array<{
  category_id: string;
  id: string;
  name: string;
  slug: string;
  image_url: string;
  is_featured: boolean;
  level: number;
}> {
  const result: Array<{
    category_id: string;
    id: string;
    name: string;
    slug: string;
    image_url: string;
    is_featured: boolean;
    level: number;
  }> = [];

  function traverseCategory(category: Category) {
    result.push({
      category_id: category.id, // Map id to category_id for backward compatibility
      id: category.id,
      name: category.name,
      slug: category.slug,
      image_url: category.image_url,
      is_featured: category.is_active, // Map is_active to is_featured
      level: category.level,
    });

    if (category.children) {
      category.children.forEach((child: Category) => {
        traverseCategory(child);
      });
    }
  }

  categories.forEach(traverseCategory);
  return result;
}

export default function CategoriesPage() {
  const categoriesData = useCategories();
  
  // Flatten all categories
  const allCategories = useMemo(() => {
    return flattenAllCategories(categoriesData);
  }, [categoriesData]);

  // Separate by level for better organization
  const departments = useMemo(() => allCategories.filter(c => c.level === 1), [allCategories]);
  const mainCategories = useMemo(() => allCategories.filter(c => c.level === 2), [allCategories]);
  const subCategories = useMemo(() => allCategories.filter(c => c.level === 3), [allCategories]);
  const leafCategories = useMemo(() => allCategories.filter(c => c.level >= 4), [allCategories]);
  const featuredCategories = useMemo(() => allCategories.filter(c => c.is_featured || c.level === 1), [allCategories]);

  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Browse All Categories</h1>
          <p className="text-gray-400">
            Explore our complete catalog of product categories
          </p>
        </div>

        {/* Featured Categories */}
        {featuredCategories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Featured Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {featuredCategories.map((category) => (
                <CategoryCard
                  key={category.category_id}
                  category_id={category.category_id}
                  name={category.name}
                  slug={category.slug}
                  image_url={category.image_url}
                  is_featured={category.is_featured}
                  level={category.level}
                />
              ))}
            </div>
          </section>
        )}

        {/* Departments (Level 1) */}
        {departments.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Departments</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {departments.map((category) => (
                <CategoryCard
                  key={category.category_id}
                  category_id={category.category_id}
                  name={category.name}
                  slug={category.slug}
                  image_url={category.image_url}
                  is_featured={category.is_featured}
                  level={category.level}
                />
              ))}
            </div>
          </section>
        )}

        {/* Main Categories (Level 2) */}
        {mainCategories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Main Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {mainCategories.map((category) => (
                <CategoryCard
                  key={category.category_id}
                  category_id={category.category_id}
                  name={category.name}
                  slug={category.slug}
                  image_url={category.image_url}
                  is_featured={category.is_featured}
                  level={category.level}
                />
              ))}
            </div>
          </section>
        )}

        {/* Sub Categories (Level 3) */}
        {subCategories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Sub Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {subCategories.map((category) => (
                <CategoryCard
                  key={category.category_id}
                  category_id={category.category_id}
                  name={category.name}
                  slug={category.slug}
                  image_url={category.image_url}
                  is_featured={category.is_featured}
                  level={category.level}
                />
              ))}
            </div>
          </section>
        )}

        {/* Leaf Categories (Level 4) */}
        {leafCategories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Leaf Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {leafCategories.map((category) => (
                <CategoryCard
                  key={category.category_id}
                  category_id={category.category_id}
                  name={category.name}
                  slug={category.slug}
                  image_url={category.image_url}
                  is_featured={category.is_featured}
                  level={category.level}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Categories Summary */}
        {allCategories.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  All Categories
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {allCategories.length} categories available
                </p>
              </div>
              <Link
                to="/products"
                className="text-netflix-red hover:underline text-sm font-medium"
              >
                View All Products →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {allCategories.map((category) => (
                <Link
                  key={category.category_id}
                  to={`/products?category=${category.category_id}`}
                  className="group relative aspect-square rounded-lg overflow-hidden border-2 border-netflix-medium-gray transition-all hover:scale-105 hover:shadow-lg hover:border-netflix-red"
                >
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-xs font-medium text-center line-clamp-2">
                      {category.name}
                    </p>
                  </div>
                  {category.is_featured && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-netflix-red rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

