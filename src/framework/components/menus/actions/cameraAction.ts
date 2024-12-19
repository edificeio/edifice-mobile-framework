import { MenuPickerActionProps } from './types';

import { I18n } from '~/app/i18n';
import { LocalFile } from '~/framework/util/fileHandler';

export default function cameraAction(props: MenuPickerActionProps & { useFrontCamera?: boolean; synchrone?: boolean }) {
  const action = async ({ callbackOnce }: { callbackOnce: boolean } = { callbackOnce: false }) =>
    LocalFile.pickFromCamera(props.callback, props.useFrontCamera, props.synchrone, callbackOnce);

  return {
    action,
    icon: {
      android: 'ic_camera',
      ios: 'camera',
    },
    title: I18n.get('cameraaction-take'),
  };
}
