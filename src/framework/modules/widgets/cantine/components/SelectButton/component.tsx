import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { SelectButtonProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';

const SelectButton: React.FC<SelectButtonProps> = props => {
  const { action, iconLeft, iconRight, testID, text, wrapperStyle } = props;

  const renderIcon = (iconName: string | undefined, size: number = UI_SIZES.elements.icon.small) => {
    if (!iconName) return null;
    return <Svg name={iconName} width={size} height={size} fill={theme.palette.grey.graphite} />;
  };

  return (
    <TouchableOpacity onPress={action} {...(testID && { testID })}>
      <View style={[wrapperStyle, styles.buttonContainer]}>
        <View style={styles.leftContent}>
          {renderIcon(iconLeft)}
          <BodyText numberOfLines={1} style={iconLeft ? styles.text : styles.textNoIcon}>
            {text}
          </BodyText>
        </View>
        {renderIcon(iconRight)}
      </View>
    </TouchableOpacity>
  );
};

export default SelectButton;
