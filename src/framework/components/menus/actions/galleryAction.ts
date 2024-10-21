import { MenuPickerActionProps } from './types';

import { I18n } from '~/app/i18n';
import { LocalFile } from '~/framework/util/fileHandler';

export default function galleryAction(props: MenuPickerActionProps & { multiple?: boolean; synchrone?: boolean }) {
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
