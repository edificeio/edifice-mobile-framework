import { ReactElement } from 'react';
import { ViewStyle } from 'react-native';

import { LabelProps } from '~/framework/components/inputs/container/label/types';

export interface InputContainerProps {
  input: ReactElement;
  label: LabelProps;
  style?: ViewStyle;
}
