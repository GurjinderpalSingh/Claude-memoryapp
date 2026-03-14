import dynamicImport from 'next/dynamic';
import { getPlaces } from '@/lib/db';
import { EmptyState } from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

// Must be dynamic with ssr:false because Leaflet uses browser APIs
const MapView = dynamicImport(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-xl">
      <p className="text-gray-400">Loading map...</p>
    </div>
  ),
});

export default function MapPage() {
  const places = getPlaces();
  const placesWithCoords = places.filter(p => p.latitude != null && p.longitude != null);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Map</h1>
        <p className="text-gray-500 text-sm mt-1">
          {placesWithCoords.length} of {places.length} place{places.length !== 1 ? 's' : ''} with location
        </p>
      </div>

      {places.length === 0 ? (
        <EmptyState
          title="No places yet"
          description="Add places with GPS coordinates to see them on the map."
          actionLabel="+ Add Place"
          actionHref="/places/new"
        />
      ) : (
        <div className="h-[600px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <MapView places={places} />
        </div>
      )}

      {places.length > 0 && placesWithCoords.length === 0 && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          None of your saved places have GPS coordinates. Use &quot;Use My Location&quot; when adding a place to see it on the map.
        </p>
      )}
    </main>
  );
}
