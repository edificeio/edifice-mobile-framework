import { NavigationProp, ParamListBase } from '@react-navigation/native';

import { AnyNavigableModule, NavigableModuleArray } from '~/framework/util/moduleTool';

export interface IWidgetChipProps {
  widget: AnyNavigableModule;
  onPress: () => void;
  testID?: string;
}

export interface IWidgetChipsContainerProps {
  widgets: NavigableModuleArray;
  navigation: NavigationProp<ParamListBase>;
}
