import { Alert, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import { I18n } from '~/app/i18n';
import Toast from '~/framework/components/toast';
import { LocalFile } from '~/framework/util/fileHandler';
import { assertPermissions } from '~/framework/util/permissions';

import { ImagePicked, MenuPickerActionProps } from './types';

export default function galleryAction(props: MenuPickerActionProps & { multiple?: boolean; synchrone?: boolean }) {
  const imageCallback = async (images: LocalFile[], inRichEditor: boolean = false) => {
    try {
      if (inRichEditor) {
        const imgsForatted = images.map(img => ({ ...img.nativeInfo, ...img }));
        if (props.synchrone) await props.callback!(imgsForatted as ImagePicked[]);
        else props.callback!(imgsForatted as ImagePicked[]);
      } else {
        for (const img of images) {
          const imgFormatted = {
            ...img.nativeInfo,
            ...img,
          };
          if (props.synchrone) await props.callback!(imgFormatted as ImagePicked);
          else props.callback!(imgFormatted as ImagePicked);
        }
      }
    } catch {
      /* empty */
    }
  };

  const action = async (inRichEditor = false) => {
    try {
      await assertPermissions('galery.read');
      LocalFile.pick({ source: 'galery', multiple: props.multiple }).then(lf => {
        let images = lf;
        if (Platform.OS === 'android') {
          lf.forEach(item => {
            if (item.filetype.startsWith('video/')) {
              Toast.showError(I18n.get('pickfile-error-filetype'));
            }
          });
        }
        images = lf.filter(item => !item.filetype.startsWith('video/'));
        return imageCallback(images, inRichEditor);
      });
    } catch {
      Alert.alert(
        I18n.get('gallery-readpermissionblocked-title'),
        I18n.get('gallery-readpermissionblocked-text', { appName: DeviceInfo.getApplicationName() }),
      );
      return undefined;
    }
  };

  return {
    title: I18n.get('galleryaction-pick'),
    icon: {
      ios: 'photo.on.rectangle.angled',
      android: 'ic_gallery',
    },
    action,
  };
}
