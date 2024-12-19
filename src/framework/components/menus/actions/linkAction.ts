import { MenuActionProps } from './types';

export default function linkAction(props: MenuActionProps) {
  return {
    action: props.action,
    icon: {
      android: 'ic_open_in_browser',
      ios: 'arrow.up.right',
    },
    title: props.title ?? '',
  };
}
