import { Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import { I18n } from '~/app/i18n';
import { LocalFile } from '~/framework/util/fileHandler';
import { assertPermissions } from '~/framework/util/permissions';

import { ImagePicked, MenuPickerActionProps } from './types';

export default function cameraAction(props: MenuPickerActionProps & { useFrontCamera?: boolean; synchrone?: boolean }) {
  const imageCallback = async (images: LocalFile[], callbackOnce: boolean = false) => {
    try {
      const formattedImages = images.map(img => ({ ...img.nativeInfo, ...img })) as ImagePicked[];
      if (callbackOnce) {
        if (props.synchrone) await props.callback!(formattedImages);
        else props.callback!(formattedImages);
      } else {
        formattedImages.forEach(async image => {
          if (props.synchrone) await props.callback!(image);
          else props.callback!(image);
        });
      }
    } catch {
      /* empty */
    }
  };

  const action = async ({ callbackOnce }: { callbackOnce: boolean } = { callbackOnce: false }) => {
    try {
      await assertPermissions('camera');
      const localFiles = await LocalFile.pick({ source: 'camera' }, props.useFrontCamera ? { cameraType: 'front' } : undefined);
      return await imageCallback(localFiles, callbackOnce);
    } catch {
      Alert.alert(
        I18n.get('camera-permissionblocked-title'),
        I18n.get('camera-permissionblocked-text', { appName: DeviceInfo.getApplicationName() }),
      );
    }
  };

  return {
    title: I18n.get('cameraaction-take'),
    icon: {
      ios: 'camera',
      android: 'ic_camera',
    },
    action,
  };
}
