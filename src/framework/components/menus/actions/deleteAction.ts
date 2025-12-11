import { MenuActionProps } from './types';

import { I18n } from '~/app/i18n';

export default function deleteAction(props: MenuActionProps) {
  return {
    action: props.action,
    destructive: true,
    disabled: props.disabled ?? false,
    icon: {
      android: 'ic_delete_item',
      ios: 'trash',
    },
    title: props.title ?? I18n.get('common-delete'),
  };
}
