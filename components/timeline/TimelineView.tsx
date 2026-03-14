import { MonthGroup } from './MonthGroup';
import { EmptyState } from '@/components/ui/EmptyState';
import type { PlaceListItem } from '@/lib/db';
import { format, parseISO } from 'date-fns';

interface TimelineViewProps {
  places: PlaceListItem[];
}

interface MonthGroup {
  month: string;
  places: PlaceListItem[];
}

function groupByMonth(places: PlaceListItem[]): MonthGroup[] {
  const map = new Map<string, PlaceListItem[]>();
  for (const place of places) {
    const monthKey = format(parseISO(place.visit_date), 'MMMM yyyy');
    if (!map.has(monthKey)) map.set(monthKey, []);
    map.get(monthKey)!.push(place);
  }
  return Array.from(map.entries()).map(([month, places]) => ({ month, places }));
}

export function TimelineView({ places }: TimelineViewProps) {
  if (places.length === 0) {
    return (
      <EmptyState
        title="No places yet"
        description="Start saving the places you visit — restaurants, hikes, travels, and more."
        actionLabel="+ Add Your First Place"
        actionHref="/places/new"
      />
    );
  }

  const groups = groupByMonth(places);

  return (
    <div>
      {groups.map(({ month, places }) => (
        <MonthGroup key={month} month={month} places={places} />
      ))}
    </div>
  );
}
