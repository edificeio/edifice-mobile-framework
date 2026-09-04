import * as React from 'react';
import { LayoutChangeEvent, View } from 'react-native';

import { PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import { WIDGET_USER_SELECTOR_AVATAR_SIZE, WIDGET_USER_SELECTOR_MAX_SHOWN } from '~/framework/modules/widgets/components/constants';
import { useTabbedPanel } from '~/framework/modules/widgets/components/tabbed-panel';

import styles from './styles';
import { WidgetUserSelectorPlaceholderProps } from './types';

export function WidgetUserSelectorPlaceholder({ count = WIDGET_USER_SELECTOR_MAX_SHOWN }: WidgetUserSelectorPlaceholderProps) {
  const panel = useTabbedPanel();

  const measure = React.useCallback(
    ({ nativeEvent: { layout } }: LayoutChangeEvent) => panel?.setTab({ height: layout.height, width: layout.width, x: layout.x }),
    [panel],
  );

  return (
    <View style={styles.row}>
      {Array.from({ length: Math.min(count, WIDGET_USER_SELECTOR_MAX_SHOWN) }, (_unused, index) => (
        <View key={index} style={styles.item} onLayout={index === 0 ? measure : undefined}>
          <View style={styles.placeholderTab}>
            <PlaceholderMedia isRound size={WIDGET_USER_SELECTOR_AVATAR_SIZE} />
            <PlaceholderLine noMargin style={[styles.placeholderName, index > 0 && styles.placeholderInitial]} />
          </View>
        </View>
      ))}
    </View>
  );
}
