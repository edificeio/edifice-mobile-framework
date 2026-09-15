import * as React from 'react';
import { View } from 'react-native';

import { PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import { WIDGET_USER_SELECTOR_AVATAR_SIZE, WIDGET_USER_SELECTOR_MAX_SHOWN } from '~/framework/modules/widgets/components/constants';
import { useTabbedPanel } from '~/framework/modules/widgets/components/panel';

import styles from './styles';
import { WidgetUserSelectorPlaceholderProps } from './types';

export function WidgetUserSelectorPlaceholder({
  count = WIDGET_USER_SELECTOR_MAX_SHOWN,
}: Readonly<WidgetUserSelectorPlaceholderProps>) {
  const panel = useTabbedPanel();
  const rowRef = React.useRef<View>(null);
  const firstTabRef = React.useRef<View>(null);

  React.useLayoutEffect(() => {
    const row = rowRef.current?.getBoundingClientRect();
    const tab = firstTabRef.current?.getBoundingClientRect();
    if (!row || !tab) return;

    panel?.setTab({ height: tab.height, width: tab.width, x: tab.x - row.x });
  }, [count, panel]);

  return (
    <View ref={rowRef} style={styles.row}>
      {Array.from({ length: Math.min(count, WIDGET_USER_SELECTOR_MAX_SHOWN) }, (_unused, index) => (
        <View key={index} ref={index === 0 ? firstTabRef : undefined} style={styles.item}>
          <View style={styles.placeholderTab}>
            <PlaceholderMedia isRound size={WIDGET_USER_SELECTOR_AVATAR_SIZE} />
            <PlaceholderLine noMargin style={[styles.placeholderName, index > 0 && styles.placeholderInitial]} />
          </View>
        </View>
      ))}
    </View>
  );
}
