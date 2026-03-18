import { ReactElement } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { LabelProps } from '~/framework/components/inputs/container/label/types';

export interface InputContainerProps {
  input: ReactElement;
  label: LabelProps;
  style?: StyleProp<ViewStyle>;
}
