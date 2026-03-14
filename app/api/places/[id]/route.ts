import { NextRequest, NextResponse } from 'next/server';
import { getPlaceById, updatePlace, deletePlace, deletePhotosByPlace, attachPhotosToPlace } from '@/lib/db';
import { deleteImage } from '@/lib/image';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const place = getPlaceById(id);
  if (!place) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(place);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    const body = await request.json();
    const { name, category, address, latitude, longitude, visit_date, notes, photo_ids } = body;

    const place = updatePlace(id, { name, category, address, latitude, longitude, visit_date, notes });
    if (!place) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (photo_ids && photo_ids.length > 0) {
      attachPhotosToPlace(photo_ids, id);
    }

    return NextResponse.json(getPlaceById(id));
  } catch (error) {
    console.error('Update place error:', error);
    return NextResponse.json({ error: 'Failed to update place' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  // Delete photo files first
  const photos = deletePhotosByPlace(id);
  for (const photo of photos) {
    deleteImage(photo.original_path, photo.thumbnail_path);
  }

  const deleted = deletePlace(id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
