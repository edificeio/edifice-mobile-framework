import * as React from 'react';
import { View } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { RichContentPaneType } from '~/framework/components/inputs/rich-text/native-viewer/types';
import { Svg, SvgIconName } from '~/framework/components/picture';

import styles, { getPaneStyle, PANE_COLORS } from './styles';
import { PaneProps } from './types';

const PANE_ICONS: Record<RichContentPaneType, SvgIconName> = {
  [RichContentPaneType.INFO]: 'ui-infoCircle',
  [RichContentPaneType.QUESTION]: 'ui-question',
  [RichContentPaneType.SUCCESS]: 'ui-success_outline',
  [RichContentPaneType.WARNING]: 'ui-alert-triangle',
};

const Pane = ({ children, type }: Readonly<PaneProps>) => {
  const paneStyle = React.useMemo(() => getPaneStyle(type), [type]);

  return (
    <View style={paneStyle} testID="rich-content-pane">
      <Svg
        name={PANE_ICONS[type]}
        fill={PANE_COLORS[type].icon}
        width={UI_SIZES.elements.icon.default}
        height={UI_SIZES.elements.icon.default}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

export default Pane;
