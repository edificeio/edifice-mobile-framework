import type { ViewStyle } from 'react-native';

import type { StepperProps } from '~/framework/components/stepper';
import type { MenuItem } from '~/framework/modules/widgets/cantine/model';

export type MenuStepsProps = Omit<StepperProps<MenuItem>, 'keyExtractor' | 'renderItem' | 'sections'> & {
  menuItems: MenuItem[];
  showAllergens?: boolean;
};

export interface MenuStepsPlaceholderProps {
  style?: ViewStyle;
}
