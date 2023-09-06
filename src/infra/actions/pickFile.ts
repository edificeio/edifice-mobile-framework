import { ActionSheetIOS, Platform } from 'react-native';
import ActionSheet from 'react-native-action-sheet';
import Permissions, { PERMISSIONS } from 'react-native-permissions';

import { I18n } from '~/app/i18n';
import { LocalFile } from '~/framework/util/fileHandler';
import { notifierShowAction } from '~/framework/util/notifier/actions';

type Captions = {
  image: string;
  document: string;
  cancel: string;
  title: string;
};

type PhotoCaptions = {
  title: string;
  cancelButtonTitle: string;
  takePhotoButtonTitle: string;
  chooseFromLibraryButtonTitle: string;
  permissionDenied: any;
};

const captions: Captions = {
  image: 'pickfile-image',
  document: 'pickfile-document',
  cancel: 'Cancel',
  title: 'pickfile-title',
};

const photoCaptions: PhotoCaptions = {
  title: 'pickfile-photo-title',
  cancelButtonTitle: 'Cancel',
  takePhotoButtonTitle: 'pickfile-take',
  chooseFromLibraryButtonTitle: 'pickfile-pick',
  permissionDenied: {
    title: 'pickfile-error-storageaccess-alert-title',
    text: 'pickfile-error-storageaccess-alert-text',
    reTryTitle: 'pickfile-error-storageaccess-alert-retry',
    okTitle: 'common-ok',
  },
};

type FilePickerPromise = (resolve: (payload: LocalFile) => void, reject: (error: Error) => void) => void;

const pick = (onlyImages?: boolean) => new Promise(onlyImages ? pickImage : pickFile);

const transformCaptions: (captions: any) => {} = captions => {
  let result = {};
  for (let caption of Object.keys(captions)) {
    if (typeof captions[caption] === 'string') {
      result[caption] = I18n.get(captions[caption]);
    } else if (typeof captions[caption] === 'object') {
      result[caption] = {};
      for (let subCaption of Object.keys(captions[caption])) {
        result[caption][subCaption] = I18n.get(captions[caption][subCaption]);
      }
    }
  }
  return result;
};

const pickFile: FilePickerPromise = (resolve, reject) => {
  const { title, image, document, cancel } = transformCaptions(captions);
  const options = [image, document, cancel];
  const cancelButtonIndex = options.indexOf(cancel);
  const elements = { title, options, cancelButtonIndex };
  const handlers = [pickImage, pickDocument(), () => pickClosed];
  const onPressAction = buttonIndex => (typeof buttonIndex === 'number' ? handlers[buttonIndex](resolve, reject) : null);

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(elements, buttonIndex => onPressAction(buttonIndex));
  } else if (Platform.OS === 'android') {
    ActionSheet.showActionSheetWithOptions(elements, buttonIndex => onPressAction(buttonIndex));
  }
};

const pickImage: FilePickerPromise = async (resolve, reject) => {
  try {
    const res = await LocalFile.pick({ source: 'galery' });
    if (res?.length === 0) throw new Error('No files selected');
    resolve(res[0]);
  } catch (error) {
    reject(new Error('Error picking image:' + error.message));
  }
};

export const pickFileError = (notifierId: string) => {
  return dispatch => {
    dispatch(
      notifierShowAction({
        id: notifierId,
        text: I18n.get('pickfile-error-storageaccess'),
        icon: 'close',
        type: 'error',
      }),
    );
  };
};

const pickDocumentAction = (onlyImages?: boolean) => async (resolve, reject) => {
  try {
    const res = await LocalFile.pick({ source: 'documents' });
    if (res?.length === 0) throw new Error('No files selected');
    resolve(res[0]);
  } catch (error) {
    reject(new Error('Error picking image:' + error.message));
  }
};

const pickDocument = (onlyImages?: boolean) => async (resolve, reject) => {
  try {
    const permissionStored = Platform.OS === 'android' && (await Permissions.check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE));
    if (permissionStored === 'denied') {
      const permissionRes = await Permissions.request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      if (permissionRes === 'denied') {
        reject(new Error('Error picking document'));
      } else {
        pickDocumentAction(onlyImages)(resolve, reject);
      }
    } else {
      pickDocumentAction(onlyImages)(resolve, reject);
    }
  } catch (err) {
    if (err.message !== 'User canceled document picker') {
      reject(new Error('Error picking document'));
    }
  }
};

const pickClosed = (_: any, reject: (error: Error) => void) => {
  reject(new Error('Cancelled picking document'));
};

export default pick;
