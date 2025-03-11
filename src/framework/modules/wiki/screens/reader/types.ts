import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Resource } from '~/framework/modules/explorer/model/types';
import type { WikiNavigationParams } from '~/framework/modules/wiki/navigation';

export namespace WikiReaderScreen {
  export interface NavParams {
    resourceId: Resource['id'];
    // pageId
  }

  export type NavigationProps = NativeStackScreenProps<WikiNavigationParams, 'reader'>;

  export type NavBarConfig = ({ navigation, route }: NavigationProps) => NativeStackNavigationOptions;

  export interface AllProps extends NavigationProps {}
}
