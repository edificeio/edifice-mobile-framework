import cameraActionFm from './cameraAction';
import deleteAction from './deleteAction';
import documentActionFm from './documentAction';
import galleryActionFm from './galleryAction';
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

export { cameraActionFm, deleteAction, documentActionFm, DocumentPicked, galleryActionFm, ImagePicked, linkAction, MenuAction };
