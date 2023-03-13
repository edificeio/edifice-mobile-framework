import I18n from 'i18n-js';
import { Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import { LocalFile } from '~/framework/util/fileHandler';
import { assertPermissions } from '~/framework/util/permissions';

import { ImagePicked, MenuPickerActionProps } from './types';

export default function galleryAction(props: MenuPickerActionProps & { multiple?: boolean; synchrone?: boolean }) {
  const imageCallback = async (images: LocalFile[]) => {
    try {
      for (const img of images) {
        const imgFormatted = {
          ...img.nativeInfo,
          ...img,
        };
        if (props.synchrone) await props.callback!(imgFormatted as ImagePicked);
        else props.callback!(imgFormatted as ImagePicked);
      }
    } catch {
      /* empty */
    }
  };

  const action = async () => {
    try {
      await assertPermissions('galery.read');
      LocalFile.pick({ source: 'galery', multiple: props.multiple }).then(lf => {
        return imageCallback(lf);
      });
    } catch {
      Alert.alert(
        I18n.t('galery.read.permission.blocked.title'),
        I18n.t('galery.read.permission.blocked.text', { appName: DeviceInfo.getApplicationName() }),
      );
      return undefined;
    }
  };

  return {
    title: I18n.t('common-photoPicker-pick'),
    icon: {
      ios: 'photo.on.rectangle.angled',
      android: 'ic_gallery',
    },
    action,
  };
}
