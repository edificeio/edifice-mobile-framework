/**
 * Data model for the module wiki
 */

import { Resource, ResourceHistory } from '~/framework/modules/explorer/model/types';

export type WikiResourceMetadata = Pick<
  Resource,
  'assetId' | 'createdAt' | 'creatorId' | 'creatorName' | 'name' | 'updatedAt' | 'thumbnail'
>;

export interface Wiki extends WikiResourceMetadata {
  description?: string;
  pages: WikiPageMetaData[];
}

export interface WikiPageMetaData {
  id: string;
  isVisible: boolean;
  title: string;
  position: number;
  depth: number;
  parentId?: WikiPageMetaData['id'];
  childrenIds: WikiPageMetaData['id'][];
}

export interface WikiPage extends Pick<WikiPageMetaData, 'id' | 'isVisible' | 'title'>, ResourceHistory {
  content: string;
  contentVersion: number;
}
