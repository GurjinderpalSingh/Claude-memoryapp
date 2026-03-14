'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PhotoGallery } from '@/components/places/PhotoGallery';
import type { PlaceWithPhotos } from '@/lib/db';
import { format, parseISO } from 'date-fns';

export default function PlaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [place, setPlace] = useState<PlaceWithPhotos | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/places/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setPlace(data);
        setLoading(false);
      });
  }, [params.id]);

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    await fetch(`/api/places/${params.id}`, { method: 'DELETE' });
    router.push('/timeline');
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </main>
    );
  }

  if (!place) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Place not found.</p>
        <Link href="/timeline" className="text-emerald-600 hover:underline text-sm mt-2 block">
          Back to timeline
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge label={place.category} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{place.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Visited {format(parseISO(place.visit_date), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/places/${place.id}/edit`}>
            <Button variant="secondary" size="sm">Edit</Button>
          </Link>
          <Button
            variant={confirmDelete ? 'danger' : 'ghost'}
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : confirmDelete ? 'Confirm Delete' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Photos */}
      {place.photos.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Photos ({place.photos.length})
          </h2>
          <PhotoGallery photos={place.photos} />
        </div>
      )}

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        {place.address && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Location</p>
            <p className="text-gray-800">{place.address}</p>
          </div>
        )}

        {place.latitude != null && place.longitude != null && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Coordinates</p>
            <p className="text-gray-600 text-sm font-mono">
              {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
            </p>
            {/* Mini static map */}
            <div className="mt-2 rounded-lg overflow-hidden h-36 bg-gray-100">
              <iframe
                title="location-map"
                width="100%"
                height="100%"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${place.longitude - 0.01},${place.latitude - 0.01},${place.longitude + 0.01},${place.latitude + 0.01}&layer=mapnik&marker=${place.latitude},${place.longitude}`}
                className="border-0"
              />
            </div>
          </div>
        )}

        {place.notes && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
            <p className="text-gray-800 whitespace-pre-wrap">{place.notes}</p>
          </div>
        )}
      </div>

      {confirmDelete && (
        <p className="text-sm text-red-500 mt-3 text-center">
          Click &quot;Confirm Delete&quot; again to permanently delete this place and all its photos.
        </p>
      )}

      <div className="mt-6">
        <Link href="/timeline" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Timeline
        </Link>
      </div>
    </main>
  );
}
