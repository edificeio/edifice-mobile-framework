import { MenuActionProps } from './types';

export default function linkAction(props: MenuActionProps) {
  return {
    title: props.title ?? '',
    icon: {
      ios: 'arrow.up.right',
      android: 'ic_open_in_browser',
    },
    action: props.action,
  };
}
