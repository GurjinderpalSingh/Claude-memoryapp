import { getPlaces, getCategories } from '@/lib/db';
import { CategoryFilter } from '@/components/categories/CategoryFilter';
import { PlaceCard } from '@/components/places/PlaceCard';
import { EmptyState } from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

interface CategoriesPageProps {
  searchParams: { category?: string };
}

export default function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const activeCategory = searchParams.category;
  const categories = getCategories();
  const places = getPlaces(activeCategory);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Categories</h1>
        <CategoryFilter categories={categories} activeCategory={activeCategory} />
      </div>

      {places.length === 0 ? (
        <EmptyState
          title={activeCategory ? `No ${activeCategory} places yet` : 'No places yet'}
          description="Add some places to see them here."
          actionLabel="+ Add Place"
          actionHref="/places/new"
        />
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {places.length} place{places.length !== 1 ? 's' : ''}
            {activeCategory ? ` in "${activeCategory}"` : ''}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {places.map(place => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
