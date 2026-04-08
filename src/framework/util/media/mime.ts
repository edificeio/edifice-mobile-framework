import { Mime } from 'mime/lite';
import otherTypes from 'mime/types/other.js';
import standardTypes from 'mime/types/standard.js';

export const mime = new Mime(standardTypes, otherTypes);
// We need to manually reconciliate some mime types that are wrongly defined by web/backend
mime.define(
  {
    'audio/flac': ['flac'],
    'audio/mp3': ['mp3'],
    'audio/wav': ['wav'],
    'audio/wma': ['wma'],
    'image/jpg': ['jpg'],
    'image/tif': ['tif'],
    'video/3gp': ['3gp'],
    'video/avi': ['avi'],
    'video/flv': ['flv'],
    'video/mkv': ['mkv'],
    'video/mpg': ['mpg'],
    'video/wmv': ['wmv'],
  },
  true,
);

export const mimeCompare = (a: string, b: string) => {
  const [a1, a2] = a.split('/');
  const [b1, b2] = b.split('/');

  if (a1 === '*' || b1 === '*') return 0;
  if (a1 !== b1) return a1.localeCompare(b1);
  if (a2 === '*' || b2 === '*') return 0;
  return a2.localeCompare(b2);
};
