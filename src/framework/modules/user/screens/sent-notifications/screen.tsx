import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';

import type { UserSentNotificationsScreenPrivateProps } from './types';

export const computeNavBar = screenOptions(() => ({
  title: I18n.get('user-sentnotifications-title'),
}));

export default function UserSentNotificationsScreen(_props: UserSentNotificationsScreenPrivateProps) {
  return null;
}
