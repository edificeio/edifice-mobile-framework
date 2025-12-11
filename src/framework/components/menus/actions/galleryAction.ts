import { MenuPickerActionFmProps, MenuPickerActionProps } from './types';

import { I18n } from '~/app/i18n';
import { LocalFile } from '~/framework/util/fileHandler';
import { FileManagerModuleName, FileManagerUsecaseName } from '~/framework/util/fileHandler/fileManagerConfig';
import { FileManager } from '~/framework/util/fileHandler/services/fileManagerService';

export function galleryAction(props: MenuPickerActionProps & { multiple?: boolean; synchrone?: boolean }) {
  const action = async ({ callbackOnce }: { callbackOnce: boolean } = { callbackOnce: false }) =>
    LocalFile.pickFromGallery(props.callback, props.multiple ?? false, props.synchrone, callbackOnce);

  return {
    action,
    icon: {
      android: 'ic_gallery',
      ios: 'photo.on.rectangle.angled',
    },
    title: I18n.get('galleryaction-pick'),
  };
}

export default function galleryActionFm<M extends FileManagerModuleName, U extends FileManagerUsecaseName<M>>(
  module: M,
  usecase: U,
  props: MenuPickerActionFmProps,
) {
  const action = async () => {
    await FileManager.pick(files => props.callback(files, 'gallery'), {
      configOverride: props.configOverride,
      module,
      onError: props.onError,
      source: 'gallery',
      usecase,
    });
  };

  return {
    action,
    icon: {
      android: 'ic_gallery',
      ios: 'photo.on.rectangle.angled',
    },
    title: I18n.get('galleryaction-pick'),
  };
}
