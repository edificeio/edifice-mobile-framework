import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';

interface MediaActionProps {
  iconName: string;
  action: () => void;
  customStyle?: object;
  customIconSize?: number;
  customIconColor?: number;
}

export const MediaAction = ({ iconName, action, customStyle, customIconSize, customIconColor }: MediaActionProps) => (
  <TouchableOpacity
    onPress={action}
    style={[
      {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        borderRadius: 20,
        height: 40,
        width: 40,
        right: 5,
        top: UI_SIZES.screen.topInset,
        backgroundColor: theme.palette.grey.black,
        opacity: 0.8,
      },
      customStyle,
    ]}>
    <Icon size={customIconSize || 16} color={customIconColor || theme.ui.text.inverse} name={iconName} />
  </TouchableOpacity>
);
