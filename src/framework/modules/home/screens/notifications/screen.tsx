import * as React from 'react';

import { MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { Badge } from '~/framework/components/badge';
import ScrollView from '~/framework/components/scrollView';
import { CaptionText } from '~/framework/components/text';

import styles from './styles';

export const HomeNotificationsScreenOptions = (): MaterialTopTabNavigationOptions => ({
  // ToDo: get the unread count of the notifications from the store.
  tabBarBadge: () => <Badge content={2} color={theme.palette.status.failure.regular} />,
  tabBarButtonTestID: 'home-tab-notifications',
  title: I18n.get('home-notifications-title'),
});

// ToDo: replace by the real tab content.
export function HomeNotificationsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <CaptionText>{I18n.get('home-notifications-title')}</CaptionText>
    </ScrollView>
  );
}
