import { NavigationProp, ParamListBase } from '@react-navigation/native';

import { AnyNavigableModule, IEntcoreWidget, NavigableModuleArray } from '~/framework/util/moduleTool';

export interface IWidgetChipProps {
  widget: AnyNavigableModule;
  entcoreWidget?: IEntcoreWidget;
  onPress: () => void;
  testID?: string;
}

export interface IWidgetChipsContainerProps {
  widgets: NavigableModuleArray;
  entcoreWidgets: IEntcoreWidget[];
  navigation: NavigationProp<ParamListBase>;
}
