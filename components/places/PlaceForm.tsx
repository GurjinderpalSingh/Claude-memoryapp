'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { PhotoUploader } from './PhotoUploader';
import type { PlaceWithPhotos } from '@/lib/db';

const PRESET_CATEGORIES = ['restaurant', 'cafe', 'bar', 'hiking', 'sports', 'travel', 'museum', 'beach', 'park'];

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  address: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  visit_date: z.string().min(1, 'Visit date is required'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface PlaceFormProps {
  mode: 'create' | 'edit';
  initialData?: PlaceWithPhotos;
  existingCategories?: string[];
}

export function PlaceForm({ mode, initialData, existingCategories = [] }: PlaceFormProps) {
  const router = useRouter();
  const [photoIds, setPhotoIds] = useState<number[]>(
    initialData?.photos.map(p => p.id) ?? []
  );
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const allCategories = Array.from(new Set([...PRESET_CATEGORIES, ...existingCategories]));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? '',
      category: initialData?.category ?? '',
      address: initialData?.address ?? '',
      latitude: initialData?.latitude?.toString() ?? '',
      longitude: initialData?.longitude?.toString() ?? '',
      visit_date: initialData?.visit_date ?? new Date().toISOString().slice(0, 10),
      notes: initialData?.notes ?? '',
    },
  });

  async function handleGpsLocate() {
    if (!navigator.geolocation) {
      setLocError('Geolocation not supported by your browser');
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setValue('latitude', latitude.toFixed(6));
        setValue('longitude', longitude.toFixed(6));

        // Reverse geocode with Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'User-Agent': 'places-memory-app' } }
          );
          const data = await res.json();
          if (data.display_name) {
            setValue('address', data.display_name);
          }
        } catch {
          // Address is optional, ignore reverse geocode failure
        }
        setLocating(false);
      },
      (err) => {
        setLocError(`Could not get location: ${err.message}`);
        setLocating(false);
      }
    );
  }

  async function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      category: values.category,
      address: values.address || undefined,
      latitude: values.latitude ? parseFloat(values.latitude) : undefined,
      longitude: values.longitude ? parseFloat(values.longitude) : undefined,
      visit_date: values.visit_date,
      notes: values.notes || undefined,
      photo_ids: photoIds,
    };

    const url = mode === 'edit' && initialData ? `/api/places/${initialData.id}` : '/api/places';
    const method = mode === 'edit' ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('Save failed:', await res.text());
      return;
    }

    const place = await res.json();
    router.push(`/places/${place.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Place Name *"
        id="name"
        placeholder="e.g. Yosemite Valley, Nobu Restaurant"
        error={errors.name?.message}
        {...register('name')}
      />

      {/* Category with datalist */}
      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-sm font-medium text-gray-700">
          Category *
        </label>
        <input
          id="category"
          list="categories-list"
          placeholder="e.g. hiking, restaurant, sports"
          className={`rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
            errors.category ? 'border-red-400' : 'border-gray-300'
          }`}
          {...register('category')}
        />
        <datalist id="categories-list">
          {allCategories.map(c => (
            <option key={c} value={c} />
          ))}
        </datalist>
        {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
      </div>

      <Input
        label="Visit Date *"
        id="visit_date"
        type="date"
        error={errors.visit_date?.message}
        {...register('visit_date')}
      />

      {/* Location */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Location</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGpsLocate}
            disabled={locating}
          >
            {locating ? 'Getting location...' : '📍 Use My Location'}
          </Button>
        </div>
        {locError && <p className="text-xs text-red-500">{locError}</p>}
        <Input
          id="address"
          placeholder="Address or location description"
          {...register('address')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="latitude"
            placeholder="Latitude"
            type="number"
            step="any"
            {...register('latitude')}
          />
          <Input
            id="longitude"
            placeholder="Longitude"
            type="number"
            step="any"
            {...register('longitude')}
          />
        </div>
      </div>

      <Textarea
        label="Notes"
        id="notes"
        placeholder="What did you love about this place?"
        {...register('notes')}
      />

      <PhotoUploader
        onPhotosChange={setPhotoIds}
        initialPhotoIds={initialData?.photos.map(p => p.id)}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Save Place'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
