import cameraAction from './cameraAction';
import deleteAction from './deleteAction';
import documentAction from './documentAction';
import galleryAction from './galleryAction';
import linkAction from './linkAction';
import { DocumentPicked, ImagePicked, MenuAction } from './types';

import { LocalFile } from '~/framework/util/fileHandler';

export const imagePickedToLocalFile = (img: ImagePicked | DocumentPicked) =>
  new LocalFile(
    {
      filename: img.fileName as string,
      filepath: img.uri as string,
      filetype: img.type as string,
    },
    { _needIOSReleaseSecureAccess: false },
  );

export { cameraAction, deleteAction, documentAction, DocumentPicked, galleryAction, ImagePicked, linkAction, MenuAction };
