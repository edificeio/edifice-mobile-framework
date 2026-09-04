import * as React from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import RNSvg, { Path } from 'react-native-svg';

import { TabbedPanelProvider } from './context';
import { buildTabbedPanelPath, TABBED_PANEL_STROKE } from './path';
import { TabbedPanelProps, TabLayout } from './types';

/**
 * A panel with, standing on top of it, the tab of whatever is selected above — the two forming one
 * shape, joined by inward curves. Lays its content out and paints that shape behind it.
 *
 * The row of tabs goes in `header`, the content of the panel in the children. Nothing else to wire:
 * the row reports where its selected tab landed on its own, through `useTabbedPanel`.
 *
 * The shape is painted before both, so everything given is drawn on top of it.
 */
export function TabbedPanel({ background, border, children, header, radius, style }: TabbedPanelProps) {
  const [size, setSize] = React.useState<{ height: number; width: number }>();
  const [tab, setTab] = React.useState<TabLayout>();

  const measurePanel = React.useCallback(
    ({ nativeEvent: { layout } }: LayoutChangeEvent) => setSize({ height: layout.height, width: layout.width }),
    [],
  );

  const contextValue = React.useMemo(() => ({ setTab }), []);

  const path = React.useMemo(
    () =>
      size ? buildTabbedPanelPath({ height: size.height, radius, tab: header ? tab : undefined, width: size.width }) : undefined,
    [header, radius, size, tab],
  );

  return (
    <View style={style} onLayout={measurePanel}>
      {path && size ? (
        <RNSvg style={StyleSheet.absoluteFill} width={size.width} height={size.height} pointerEvents="none">
          <Path d={path} fill={background} stroke={border} strokeWidth={TABBED_PANEL_STROKE} />
        </RNSvg>
      ) : null}
      <TabbedPanelProvider value={contextValue}>{header}</TabbedPanelProvider>
      {children}
    </View>
  );
}
