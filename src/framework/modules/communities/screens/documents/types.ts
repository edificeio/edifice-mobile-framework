import { AppName, CommunityResponseDto } from '@edifice.io/community-client-rest-rn';
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

export type CommunitiesDocumentId = CommunityResponseDto['id'];
export type CommunitiesDocumentAppName = AppName;

export type CommunitiesDocumentItem = DocumentItem<CommunitiesDocumentAppName, CommunitiesDocumentId>;
