import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const ORIGINALS_DIR = path.join(UPLOADS_DIR, 'originals');
const THUMBNAILS_DIR = path.join(UPLOADS_DIR, 'thumbnails');

function ensureDirs() {
  fs.mkdirSync(ORIGINALS_DIR, { recursive: true });
  fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
}

export interface SavedImage {
  original_path: string;   // URL path served by Next.js: /uploads/originals/xxx.jpg
  thumbnail_path: string;  // URL path: /uploads/thumbnails/xxx_thumb.jpg
  width: number;
  height: number;
  size_bytes: number;
}

export async function saveImage(buffer: Buffer, originalFilename: string): Promise<SavedImage> {
  ensureDirs();

  const ext = path.extname(originalFilename).toLowerCase() || '.jpg';
  const id = uuidv4();
  const originalFilename2 = `${id}${ext}`;
  const thumbFilename = `${id}_thumb.jpg`;

  const originalAbsPath = path.join(ORIGINALS_DIR, originalFilename2);
  const thumbAbsPath = path.join(THUMBNAILS_DIR, thumbFilename);

  // Import sharp dynamically so it's not bundled
  const sharp = (await import('sharp')).default;

  // Get metadata
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  // Save original
  await sharp(buffer).toFile(originalAbsPath);

  // Save thumbnail (400x400 cover crop, always JPEG)
  await sharp(buffer)
    .resize(400, 400, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 85 })
    .toFile(thumbAbsPath);

  return {
    original_path: `/uploads/originals/${originalFilename2}`,
    thumbnail_path: `/uploads/thumbnails/${thumbFilename}`,
    width,
    height,
    size_bytes: buffer.length,
  };
}

export function deleteImage(originalPath: string, thumbnailPath: string): void {
  const toAbsolute = (urlPath: string) =>
    path.join(process.cwd(), 'public', urlPath);

  try {
    fs.unlinkSync(toAbsolute(originalPath));
  } catch {
    // File may not exist, ignore
  }
  try {
    fs.unlinkSync(toAbsolute(thumbnailPath));
  } catch {
    // File may not exist, ignore
  }
}
