import { getPlaces } from '@/lib/db';
import { TimelineView } from '@/components/timeline/TimelineView';

export const dynamic = 'force-dynamic';

export default function TimelinePage() {
  const places = getPlaces();
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timeline</h1>
          <p className="text-gray-500 text-sm mt-1">
            {places.length} place{places.length !== 1 ? 's' : ''} visited
          </p>
        </div>
      </div>
      <TimelineView places={places} />
    </main>
  );
}
