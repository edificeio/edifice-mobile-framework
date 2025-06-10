import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { ICON_HEIGHT, ICON_WIDTH, styles } from './styles';
import { IconChipProps } from './types';

import { Svg } from '~/framework/components/picture';

const IconChip: React.FC<IconChipProps> = ({ icon, iconColor, iconContainerColor, testId }) => {
  const iconContainerStyle: StyleProp<ViewStyle> = React.useMemo(
    () => [styles.iconContainer, { backgroundColor: iconContainerColor }],
    [iconContainerColor],
  );

  return (
    <View style={iconContainerStyle} {...(testId && { testID: testId })}>
      <Svg name={icon} fill={iconColor} height={ICON_HEIGHT} width={ICON_WIDTH} />
    </View>
  );
};

export default IconChip;
