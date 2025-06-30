import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export namespace CommunitiesDocumentsScreen {
  export interface NavParams { }
  export type NavigationProps = NativeStackScreenProps<CommunitiesNavigationParams, 'documents'>;
  export type AllProps = CommunitiesDocumentsScreen.NavigationProps;
}
