import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Resource } from '~/framework/modules/explorer/model/types';
import { WikiPageMetaData } from '~/framework/modules/wiki/model';
import type { WikiNavigationParams } from '~/framework/modules/wiki/navigation';

export namespace WikiReaderScreen {
  export interface NavParams {
    resourceId: Resource['id'];
    pageId: WikiPageMetaData['id'];
    reverseAnimation?: boolean;
  }

  export type NavigationProps = NativeStackScreenProps<WikiNavigationParams, 'reader'>;

  export type NavBarConfig = ({ navigation, route }: NavigationProps) => NativeStackNavigationOptions;

  export interface AllProps extends NavigationProps {}
}
