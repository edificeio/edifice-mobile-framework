import ImageResizer from '@bam.tech/react-native-image-resizer';
import moment from 'moment';
import { Asset as RNImageAsset } from 'react-native-image-picker';

import { LocalFile } from '~/framework/util/fileHandler/models/localFile';
import { Asset } from '~/framework/util/fileHandler/types';

export const IMAGE_MAX_DIMENSION = 1440;
export const IMAGE_MAX_QUALITY = 80;
export const safe = <T>(v: T | null | undefined): T | undefined => (v == null ? undefined : v);

export function getExtSafe(name: string | null | undefined): string | undefined {
  const clean = safe(name);
  if (!clean || !clean.includes('.')) return undefined;
  const ext = clean.split('.').pop();
  return ext || undefined;
}

export function guessMimeFromExt(ext?: string): string {
  if (!ext) return 'application/octet-stream';

  const map: Record<string, string> = {
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    pdf: 'application/pdf',
    png: 'image/png',
    wav: 'audio/wav',
  };

  return map[ext.toLowerCase()] ?? 'application/octet-stream';
}

export function fallbackMime(type: string | null | undefined, name: string | null | undefined): string {
  const ext = getExtSafe(name);

  // Correction des types null ou incorrects
  if (!type || type === 'null') return guessMimeFromExt(ext);

  // Correction types non standard
  switch (type) {
    case 'image/jpg':
      return 'image/jpeg';
    case 'image/tif':
      return 'image/tiff';
    default:
      return type;
  }
}

export function wrapPicker(fn: (cb: (files: LocalFile[] | LocalFile) => void) => void): Promise<LocalFile[]> {
  return new Promise(resolve => {
    fn(files => resolve(Array.isArray(files) ? files : [files]));
  });
}

export async function processImage(asset: RNImageAsset): Promise<Asset | null> {
  if (!asset.uri) return null;

  try {
    const resized = await ImageResizer.createResizedImage(
      asset.uri,
      IMAGE_MAX_DIMENSION,
      IMAGE_MAX_DIMENSION,
      'JPEG',
      IMAGE_MAX_QUALITY,
    );

    const filename = `${moment().format('YYYYMMDD-HHmmss')}.jpg`;

    return {
      ...resized,
      fileName: filename,
      fileSize: resized.size,
      name: filename,
      originalPath: resized.path,
      type: 'image/jpeg',
      uri: resized.uri ?? resized.path,
    };
  } catch (err) {
    console.error('[processImage] FAILED:', err);
    return null;
  }
}
