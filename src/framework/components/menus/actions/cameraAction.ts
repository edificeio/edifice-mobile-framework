import { Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import { I18n } from '~/app/i18n';
import { LocalFile } from '~/framework/util/fileHandler';
import { assertPermissions } from '~/framework/util/permissions';

import { ImagePicked, MenuPickerActionProps } from './types';

export default function cameraAction(props: MenuPickerActionProps & { useFrontCamera?: boolean }) {
  const imageCallback = async (images: LocalFile[]) => {
    try {
      for (const img of images) {
        const imgFormatted = {
          ...img.nativeInfo,
          ...img,
        };
        props.callback!(imgFormatted as ImagePicked);
      }
    } catch {
      /* empty */
    }
  };

  const action = async () => {
    try {
      await assertPermissions('camera');
      LocalFile.pick({ source: 'camera' }, props.useFrontCamera ? { cameraType: 'front' } : undefined).then(lf => {
        return imageCallback(lf);
      });
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
