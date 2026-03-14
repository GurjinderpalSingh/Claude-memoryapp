import { notFound } from 'next/navigation';
import { getPlaceById, getCategories } from '@/lib/db';
import { PlaceForm } from '@/components/places/PlaceForm';

export const dynamic = 'force-dynamic';

interface EditPageProps {
  params: { id: string };
}

export default function EditPlacePage({ params }: EditPageProps) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const place = getPlaceById(id);
  if (!place) notFound();

  const categories = getCategories();

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Place</h1>
      <PlaceForm
        mode="edit"
        initialData={place}
        existingCategories={categories.map(c => c.name)}
      />
    </main>
  );
}
