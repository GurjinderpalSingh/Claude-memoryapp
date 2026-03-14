'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import type { Photo } from '@/lib/db';

interface PhotoUploaderProps {
  onPhotosChange: (photoIds: number[]) => void;
  initialPhotoIds?: number[];
}

interface UploadedPhoto {
  photo: Photo;
  previewUrl: string;
}

export function PhotoUploader({ onPhotosChange, initialPhotoIds = [] }: PhotoUploaderProps) {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<Photo | null> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Upload failed');
    }
    return res.json();
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setUploading(true);

    const newPhotos: UploadedPhoto[] = [];
    for (const file of acceptedFiles) {
      try {
        const photo = await uploadFile(file);
        if (photo) {
          newPhotos.push({
            photo,
            previewUrl: URL.createObjectURL(file),
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    }

    const updated = [...uploadedPhotos, ...newPhotos];
    setUploadedPhotos(updated);
    onPhotosChange([...initialPhotoIds, ...updated.map(p => p.photo.id)]);
    setUploading(false);
  }, [uploadedPhotos, initialPhotoIds, onPhotosChange]);

  function removePhoto(photoId: number) {
    const updated = uploadedPhotos.filter(p => p.photo.id !== photoId);
    setUploadedPhotos(updated);
    onPhotosChange([...initialPhotoIds, ...updated.map(p => p.photo.id)]);
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic'] },
    maxSize: 20 * 1024 * 1024,
    multiple: true,
  });

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-2">Photos</label>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-4xl mb-2">📷</p>
        <p className="text-sm text-gray-600">
          {isDragActive ? 'Drop photos here' : 'Drag & drop photos, or click to select'}
        </p>
        <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, HEIC up to 20MB</p>

        {/* Camera button for mobile */}
        <label
          className="mt-3 inline-block px-3 py-1.5 text-xs bg-gray-100 rounded-lg text-gray-600 cursor-pointer hover:bg-gray-200"
          onClick={e => e.stopPropagation()}
        >
          📸 Take Photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={async e => {
              if (e.target.files?.[0]) {
                await onDrop([e.target.files[0]]);
              }
            }}
          />
        </label>
      </div>

      {uploading && (
        <p className="text-sm text-gray-500 mt-2 animate-pulse">Uploading...</p>
      )}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

      {/* Preview grid */}
      {uploadedPhotos.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-3">
          {uploadedPhotos.map(({ photo, previewUrl }) => (
            <div key={photo.id} className="relative group">
              <div className="relative h-20 w-full rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={previewUrl}
                  alt="Upload preview"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
