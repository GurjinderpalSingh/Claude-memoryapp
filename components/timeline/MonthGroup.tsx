import { PlaceCard } from '@/components/places/PlaceCard';
import type { PlaceListItem } from '@/lib/db';

interface MonthGroupProps {
  month: string; // e.g. "March 2025"
  places: PlaceListItem[];
}

export function MonthGroup({ month, places }: MonthGroupProps) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-gray-800">{month}</h2>
        <span className="text-sm text-gray-400">{places.length} place{places.length !== 1 ? 's' : ''}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {places.map(place => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </div>
  );
}
