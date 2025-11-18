import { MenuPickerActionFmProps, MenuPickerActionProps } from './types';

import { I18n } from '~/app/i18n';
import { LocalFile } from '~/framework/util/fileHandler';
import { FileManagerModuleName, FileManagerUsecaseName } from '~/framework/util/fileHandler/fileManagerConfig';
import { FileManager } from '~/framework/util/fileHandler/services/fileManagerService';

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

export function cameraActionFm<M extends FileManagerModuleName, U extends FileManagerUsecaseName<M>>(
  module: M,
  usecase: U,
  props: MenuPickerActionFmProps,
) {
  const action = async (opts?: { callbackOnce?: boolean }) => {
    await FileManager.pick(module, usecase, files => props.callback(files, 'camera'), {
      callbackOnce: opts?.callbackOnce ?? false,
      source: 'camera',
    });
  };

  return {
    action,
    icon: {
      android: 'ic_camera',
      ios: 'camera',
    },
    title: I18n.get('cameraaction-take'),
  };
}
