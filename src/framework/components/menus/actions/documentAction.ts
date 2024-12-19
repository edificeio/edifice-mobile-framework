import { MenuPickerActionProps } from './types';

import { I18n } from '~/app/i18n';
import { LocalFile } from '~/framework/util/fileHandler';

export default function documentAction(props: MenuPickerActionProps & { synchrone?: boolean }) {
  const action = () => LocalFile.pickFromDocuments(props.callback, props.synchrone);

  return {
    action,
    icon: {
      android: 'ic_upload_file',
      ios: 'doc.badge.plus',
    },
    title: I18n.get('documentaction-document'),
  };
}
