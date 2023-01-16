import I18n from 'i18n-js';

import { MenuActionProps } from './types';

export default function deleteAction(props: MenuActionProps) {
  return {
    title: I18n.t('delete'),
    icon: {
      ios: 'trash',
      android: 'ic_delete_item',
    },
    destructive: true,
    action: props.action,
  };
}
