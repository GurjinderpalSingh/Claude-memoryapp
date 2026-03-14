'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import type { PlaceListItem } from '@/lib/db';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/Badge';

// Fix Leaflet default marker icon issue in Next.js
import L from 'leaflet';

interface MapViewProps {
  places: PlaceListItem[];
}

export default function MapView({ places }: MapViewProps) {
  useEffect(() => {
    // Fix Leaflet marker icons
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, []);

  const placesWithCoords = places.filter(p => p.latitude != null && p.longitude != null);

  // Default center: world view if no places, or center of all places
  const center: [number, number] =
    placesWithCoords.length > 0
      ? [
          placesWithCoords.reduce((sum, p) => sum + p.latitude!, 0) / placesWithCoords.length,
          placesWithCoords.reduce((sum, p) => sum + p.longitude!, 0) / placesWithCoords.length,
        ]
      : [20, 0];

  const zoom = placesWithCoords.length > 0 ? 5 : 2;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className="rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {placesWithCoords.map(place => (
        <Marker key={place.id} position={[place.latitude!, place.longitude!]}>
          <Popup>
            <div className="min-w-[160px]">
              <p className="font-semibold text-gray-900 mb-1">{place.name}</p>
              <Badge label={place.category} />
              <p className="text-xs text-gray-500 mt-1">
                {format(parseISO(place.visit_date), 'MMM d, yyyy')}
              </p>
              {place.address && (
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{place.address}</p>
              )}
              <Link
                href={`/places/${place.id}`}
                className="mt-2 block text-xs text-emerald-600 hover:underline"
              >
                View details →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
