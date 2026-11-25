/**
 * Data model for the module wiki
 */

import { Temporal } from '@js-temporal/polyfill';

import { CommentsThread } from '~/framework/modules/comments/templates/comments-thread';
import { Resource, ResourceHistory } from '~/framework/modules/explorer/model/types';

export type WikiResourceMetadata = Pick<
  Resource,
  'assetId' | 'createdAt' | 'creatorId' | 'creatorName' | 'name' | 'updatedAt' | 'thumbnail'
>;

export interface Wiki extends WikiResourceMetadata {
  description?: string;
  pages: WikiPageMetaData[];
  rights: string[];
}

export interface WikiPageMetaData {
  id: string;
  isVisible: boolean;
  title: string;
  position: number;
  depth: number;
  parentId?: WikiPageMetaData['id'];
  childrenIds: WikiPageMetaData['id'][];
  createdAt: Temporal.Instant;
}

export interface WikiPage extends Pick<WikiPageMetaData, 'id' | 'isVisible' | 'title' | 'createdAt'>, ResourceHistory {
  content: string;
  contentVersion: number;
  comments: CommentsThread.Props['data'];
}
