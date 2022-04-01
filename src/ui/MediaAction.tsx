import * as React from 'react';
import { TouchableOpacity } from 'react-native';



import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/ui/icons/Icon';


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
        backgroundColor: 'rgba(0,0,0,0.3)',
      },
      customStyle,
    ]}>
    <Icon size={customIconSize || 16} color={customIconColor || '#ffffff'} name={iconName} />
  </TouchableOpacity>
);