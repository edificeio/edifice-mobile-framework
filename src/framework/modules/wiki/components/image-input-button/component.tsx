import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { BUTTON_ICON_SIZE, styles } from './styles';
import { ImageInputButtonProps } from './types';

import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';

const ImageInputButton: React.FC<ImageInputButtonProps> = ({ contentColor, icon, onPress }) => {
  const WrapperComponent = onPress ? TouchableOpacity : View;

  return (
    <WrapperComponent onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.border}>
          <Svg
            name={icon ?? 'pictos-external-link'}
            width={BUTTON_ICON_SIZE}
            height={BUTTON_ICON_SIZE}
            fill={contentColor ?? theme.palette.grey.graphite}
          />
        </View>
      </View>
    </WrapperComponent>
  );
};

export default ImageInputButton;
