import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine } from 'rn-placeholder';

import { WidgetPlaceholderProps } from '~/framework/modules/widgets/components/types';
import { WidgetUserPanelPlaceholder } from '~/framework/modules/widgets/components/user-panel';

import styles from './styles';

const DAYS = [0, 1];

export function ScreenTimeWidgetPlaceholder({ hasTabs }: Readonly<WidgetPlaceholderProps>) {
  return (
    <Placeholder Animation={Fade}>
      <WidgetUserPanelPlaceholder hasTabs={hasTabs}>
        <View style={styles.durations}>
          {DAYS.map(day => (
            <View key={day} style={styles.day}>
              <PlaceholderLine width={60} noMargin />
              <PlaceholderLine width={40} noMargin style={styles.placeholderDuration} />
            </View>
          ))}
        </View>
      </WidgetUserPanelPlaceholder>
    </Placeholder>
  );
}
