import { MenuPickerActionFmProps, MenuPickerActionProps } from './types';

import { I18n } from '~/app/i18n';
import { LocalFile } from '~/framework/util/fileHandler';
import { FileManagerModuleName, FileManagerUsecaseName } from '~/framework/util/fileHandler/fileManagerConfig';
import { FileManager } from '~/framework/util/fileHandler/services/fileManagerService';

export default function documentAction(props: MenuPickerActionProps & { synchrone?: boolean }) {
  const action = () => LocalFile.pickFromDocuments(props.callback, props.synchrone, true);

  return {
    action,
    icon: {
      android: 'ic_upload_file',
      ios: 'doc.badge.plus',
    },
    title: I18n.get('documentaction-document'),
  };
}

export function documentActionFm<M extends FileManagerModuleName, U extends FileManagerUsecaseName<M>>(
  module: M,
  usecase: U,
  props: MenuPickerActionFmProps,
) {
  const action = async () => {
    await FileManager.pick(module, usecase, files => props.callback(files, 'documents'), {
      configOverride: props.configOverride,
      source: 'documents',
    });
  };

  return {
    action,
    icon: {
      android: 'ic_upload_file',
      ios: 'doc.badge.plus',
    },
    title: I18n.get('documentaction-document'),
  };
}
