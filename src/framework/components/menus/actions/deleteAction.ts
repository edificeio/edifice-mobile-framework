import { I18n } from '~/app/i18n';

import { MenuActionProps } from './types';

export default function deleteAction(props: MenuActionProps) {
  return {
    title: I18n.get('common-delete'),
    icon: {
      ios: 'trash',
      android: 'ic_delete_item',
    },
    destructive: true,
    action: props.action,
  };
}
