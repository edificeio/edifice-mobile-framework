import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { BUTTON_ICON_SIZE, styles } from './styles';

import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';

const ImageInputButton = ({ contentColor, icon }) => {
  const onPressAction = () => {
    // if (url) return openActionUrl();
    // if (action) return action();
    console.log('btn action to be implemented');
  };
  const renderIcon = iconName => {
    return (
      <View style={styles.container}>
        <View style={styles.border}>
          <Svg
            name={iconName ?? 'pictos-external-link'}
            width={BUTTON_ICON_SIZE}
            height={BUTTON_ICON_SIZE}
            fill={contentColor ?? theme.palette.grey.graphite}
          />
        </View>
      </View>
    );
  };
  return <TouchableOpacity onPress={onPressAction}>{renderIcon(icon)}</TouchableOpacity>;
};

export default ImageInputButton;
