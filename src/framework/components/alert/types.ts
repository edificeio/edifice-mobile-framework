import React from 'react';
import { StyleProp, Text, ViewProps, ViewStyle } from 'react-native';

import theme, { IShades } from '~/app/theme';

import { PictureProps } from '../picture';

export interface AlertCardProps {
  type: keyof typeof theme.palette.status;
  text?: string | React.ReactElement<typeof Text>;
  icon?: PictureProps;
  label?: string;
  onLabelPress?: () => void;
  onClose?: () => void;
  renderCloseButton?: (colorShades: IShades, onClose?: () => void) => React.ReactElement | null;
  shadow?: boolean;
  containerProps?: ViewProps;
  style?: StyleProp<ViewStyle>;
}
