import I18n from 'i18n-js';
import { Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import { LocalFile } from '~/framework/util/fileHandler';
import { assertPermissions } from '~/framework/util/permissions';

import { ImagePicked } from '../types';
import { PopupPickerActionProps } from './types';

export default function cameraAction(props: PopupPickerActionProps & { useFrontCamera?: boolean }) {
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
        I18n.t('camera.permission.blocked.title'),
        I18n.t('camera.permission.blocked.text', { appName: DeviceInfo.getApplicationName() }),
      );
    }
  };

  return {
    title: I18n.t('common-photoPicker-take'),
    iconIos: 'camera',
    iconAndroid: 'ic_camera',
    action,
  };
}
