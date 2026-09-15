import * as React from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import RNSvg, { Path } from 'react-native-svg';

import { PanelProvider } from './context';
import { buildPanelPath, PANEL_STROKE } from './path';
import { PanelProps, TabLayout } from './types';

/**
 * A panel painted behind its content, as a single shape.
 *
 * Without `header`, that shape is a plain rounded rectangle. Given a row of tabs in `header`, the
 * tab of whatever is selected joins the panel by inward curves — which no border radius can draw,
 * hence the path. Both cases come out of the same builder, so corners and border always match.
 *
 * Nothing else to wire: the row reports where its selected tab landed on its own, through
 * `useTabbedPanel`. The shape is painted first, so everything given is drawn on top of it.
 */
export function Panel({ background, border, children, header, radius, style }: PanelProps) {
  const [size, setSize] = React.useState<{ height: number; width: number }>();
  const [tab, setTab] = React.useState<TabLayout>();

  const measurePanel = React.useCallback(
    ({ nativeEvent: { layout } }: LayoutChangeEvent) => setSize({ height: layout.height, width: layout.width }),
    [],
  );

  const contextValue = React.useMemo(() => ({ setTab }), []);

  const path = React.useMemo(
    () => (size ? buildPanelPath({ height: size.height, radius, tab: header ? tab : undefined, width: size.width }) : undefined),
    [header, radius, size, tab],
  );

  return (
    <View style={style} onLayout={measurePanel}>
      {path && size ? (
        <RNSvg style={StyleSheet.absoluteFill} width={size.width} height={size.height} pointerEvents="none">
          <Path d={path} fill={background} stroke={border} strokeWidth={PANEL_STROKE} />
        </RNSvg>
      ) : null}
      <PanelProvider value={contextValue}>{header}</PanelProvider>
      {children}
    </View>
  );
}
