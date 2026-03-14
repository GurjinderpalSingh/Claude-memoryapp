import { getCategories } from '@/lib/db';
import { PlaceForm } from '@/components/places/PlaceForm';

export const dynamic = 'force-dynamic';

export default function NewPlacePage() {
  const categories = getCategories();
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Place</h1>
      <PlaceForm
        mode="create"
        existingCategories={categories.map(c => c.name)}
      />
    </main>
  );
}
