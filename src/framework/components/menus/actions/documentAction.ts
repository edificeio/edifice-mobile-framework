import getPath from '@flyerhq/react-native-android-uri-path';
import { Alert, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';

import { I18n } from '~/app/i18n';
import { assertPermissions } from '~/framework/util/permissions';

import { MenuPickerActionProps } from './types';

export default function documentAction(props: MenuPickerActionProps & { synchrone?: boolean }) {
  const documentCallback = async (files: DocumentPickerResponse[]) => {
    try {
      for (const file of files) {
        file.uri = Platform.select({
          android: getPath(file.uri),
          default: decodeURI(file.uri.indexOf('file://') > -1 ? file.uri.split('file://')[1] : file.uri),
        });
        if (props.synchrone) await props.callback!({ fileName: file.name!, fileSize: file.size!, uri: file.uri, type: file.type });
        else props.callback!({ fileName: file.name!, fileSize: file.size!, uri: file.uri, type: file.type });
      }
    } catch {
      /* empty */
    }
  };

  const action = async () => {
    try {
      await assertPermissions('documents.read');
      DocumentPicker.pick({
        type: DocumentPicker.types.allFiles,
        presentationStyle: 'fullScreen',
      }).then(file => {
        return documentCallback(file);
      });
    } catch {
      Alert.alert(
        I18n.get('document.permission.blocked.title'),
        I18n.get('document.permission.blocked.text', { appName: DeviceInfo.getApplicationName() }),
      );
    }
  };

  return {
    title: I18n.get('common-picker-document'),
    icon: {
      ios: 'doc.badge.plus',
      android: 'ic_upload_file',
    },
    action,
  };
}
