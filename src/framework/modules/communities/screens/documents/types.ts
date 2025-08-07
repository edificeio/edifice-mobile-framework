import { ResourceDto } from '@edifice.io/community-client-rest-rn';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { DocumentItem } from '~/framework/components/list/paginated-document-list/types';
import type { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export namespace CommunitiesDocumentsScreen {
  export interface NavParams {
    communityId: number;
  }
  export type NavigationProps = NativeStackScreenProps<CommunitiesNavigationParams, 'documents'>;
  export type AllProps = CommunitiesDocumentsScreen.NavigationProps;
}

export type CommunitiesDocumentItem = Omit<DocumentItem, 'appName'> & { appName: ResourceDto['appName'] };
