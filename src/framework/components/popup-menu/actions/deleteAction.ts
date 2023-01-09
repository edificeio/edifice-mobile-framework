import I18n from 'i18n-js';

import { PopupActionProps } from './types';

export default function deleteAction(props: PopupActionProps) {
  return {
    title: I18n.t('delete'),
    iconIos: 'trash',
    iconAndroid: 'ic_delete_item',
    destructive: true,
    action: props.action,
  };
}
