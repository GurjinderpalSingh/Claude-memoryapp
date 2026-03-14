import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import type { PlaceListItem } from '@/lib/db';
import { format, parseISO } from 'date-fns';

interface PlaceCardProps {
  place: PlaceListItem;
}

export function PlaceCard({ place }: PlaceCardProps) {
  return (
    <Link href={`/places/${place.id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="relative w-full h-40 bg-gray-100">
          {place.thumbnail ? (
            <Image
              src={place.thumbnail}
              alt={place.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl text-gray-300">
              📍
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">
              {place.name}
            </h3>
            <Badge label={place.category} />
          </div>
          <p className="text-xs text-gray-500 mb-1">
            {format(parseISO(place.visit_date), 'MMM d, yyyy')}
          </p>
          {place.address && (
            <p className="text-xs text-gray-400 line-clamp-1">{place.address}</p>
          )}
          {place.photo_count > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {place.photo_count} photo{place.photo_count !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
