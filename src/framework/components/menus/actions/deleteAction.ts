import { MenuActionProps } from './types';

import { I18n } from '~/app/i18n';

export default function deleteAction(props: MenuActionProps) {
  return {
    action: props.action,
    destructive: true,
    icon: {
      android: 'ic_delete_item',
      ios: 'trash',
    },
    title: I18n.get('common-delete'),
  };
}
