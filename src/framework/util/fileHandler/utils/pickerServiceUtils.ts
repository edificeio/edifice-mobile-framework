import ImageResizer from '@bam.tech/react-native-image-resizer';
import moment from 'moment';
import { Asset as RNImageAsset } from 'react-native-image-picker';

import { LocalFile } from '~/framework/util/fileHandler/models';
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
  return ext ? `${ext}/*` : 'application/octet-stream';
}

export function fallbackMime(type?: string | null, name?: string | null): string {
  if (type && type !== 'null') return type;

  const ext = getExtSafe(name);
  if (!ext) return 'application/octet-stream';

  return guessMimeFromExt(ext);
}

export function wrapPicker(fn: (cb: (files: LocalFile[] | LocalFile) => void) => void | Promise<void>): Promise<LocalFile[]> {
  return new Promise((resolve, reject) => {
    try {
      const result = fn(files => {
        resolve(Array.isArray(files) ? files : [files]);
      });

      if (result instanceof Promise) {
        result.catch(reject);
      }
    } catch (err) {
      reject(err);
    }
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

    // Second-precision alone isn't unique enough: picking several images from the gallery at
    // once resizes them concurrently, and images finishing within the same second would get the
    // identical name — Carbonio's attachment upload disambiguates same-named uploads by matching
    // filename, so a collision here causes the wrong image to be resolved for an attachment
    const filename = `${moment().format('YYYYMMDD-HHmmss')}-${Math.random().toString(36).slice(2, 8)}.jpg`;

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

export const logFileManagerConfig = (label: string, data: Record<string, unknown>) => {
  if (!__DEV__) return;
  console.debug(`[FileManager] ${label}`, data);
};
