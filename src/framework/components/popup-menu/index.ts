import { LocalFile } from '~/framework/util/fileHandler';

import cameraAction from './actions/cameraAction';
import deleteAction from './actions/deleteAction';
import documentAction from './actions/documentAction';
import galleryAction from './actions/galleryAction';
import linkAction from './actions/linkAction';
import { PopupMenu } from './component';
import { DocumentPicked, ImagePicked, PopupMenuAction } from './types';

export const imagePickedToLocalFile = (img: ImagePicked) =>
  new LocalFile(
    {
      filename: img.fileName as string,
      filepath: img.uri as string,
      filetype: img.type as string,
    },
    { _needIOSReleaseSecureAccess: false },
  );

export { PopupMenuAction, DocumentPicked, ImagePicked, cameraAction, deleteAction, documentAction, galleryAction, linkAction };
export default PopupMenu;
