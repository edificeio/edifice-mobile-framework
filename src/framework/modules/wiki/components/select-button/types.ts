import { ViewStyle } from 'react-native';

import { DefaultButtonProps } from '~/framework/components/buttons/default';

export interface SelectButtonProps extends DefaultButtonProps {
  wrapperStyle: ViewStyle;
  testId?: string;
}
