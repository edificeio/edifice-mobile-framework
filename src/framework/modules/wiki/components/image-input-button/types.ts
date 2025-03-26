import { ColorValue } from 'react-native';

import { SvgProps } from '~/framework/components/picture';

export interface ImageInputButtonProps {
    contentColor?: ColorValue;
    icon?: SvgProps['name'];
    onPress?: () => void;
}
