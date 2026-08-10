import * as React from 'react';

import { MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';

import { I18n } from '~/app/i18n';
import ScrollView from '~/framework/components/scrollView';
import { CaptionText } from '~/framework/components/text';

import styles from './styles';

// Options must stay a function: `I18n.init()` is async, so a key read at module scope would be raw.
export const HomeOverviewScreenOptions = (): MaterialTopTabNavigationOptions => ({
  tabBarButtonTestID: 'home-tab-overview',
  title: I18n.get('home-overview-title'),
});

// ToDo: replace by the real tab content.
export function HomeOverviewScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <CaptionText>{I18n.get('home-overview-title')}</CaptionText>
    </ScrollView>
  );
}
