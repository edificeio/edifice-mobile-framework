import { PopupActionProps } from './types';

export default function linkAction(props: PopupActionProps) {
  return {
    title: props.title ?? '',
    iconIos: 'arrow.up.right',
    iconAndroid: 'ic_open_in_browser',
    action: props.action,
  };
}
