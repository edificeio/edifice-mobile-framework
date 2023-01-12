import { PopupActionProps } from './types';

export default function linkAction(props: PopupActionProps) {
  return {
    title: props.title ?? '',
    icon: {
      ios: 'arrow.up.right',
      android: 'ic_open_in_browser',
    },
    action: props.action,
  };
}
