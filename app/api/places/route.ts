import { NextRequest, NextResponse } from 'next/server';
import { getPlaces, createPlace, attachPhotosToPlace } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;

  const places = getPlaces(category);
  return NextResponse.json({ places });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, address, latitude, longitude, visit_date, notes, photo_ids } = body;

    if (!name || !category || !visit_date) {
      return NextResponse.json(
        { error: 'name, category, and visit_date are required' },
        { status: 400 }
      );
    }

    const place = createPlace({ name, category, address, latitude, longitude, visit_date, notes });

    if (photo_ids && photo_ids.length > 0) {
      attachPhotosToPlace(photo_ids, place.id);
    }

    return NextResponse.json(place, { status: 201 });
  } catch (error) {
    console.error('Create place error:', error);
    return NextResponse.json({ error: 'Failed to create place' }, { status: 500 });
  }
}
