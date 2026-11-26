/**
 * Data model for the module wiki
 */

import { Temporal } from '@js-temporal/polyfill';

import type * as CommentsThread from '~/framework/modules/comments/types';

/**
 * Who created and last updated a wiki or a page, and when.
 * Ids are optional: the creator or the updater can be a deleted user.
 */
export interface WikiResourceHistory {
  createdAt: Temporal.Instant;
  creatorId?: string;
  creatorName: string;
  updatedAt?: Temporal.Instant;
  updaterId?: string;
  updaterName?: string;
}

export interface WikiResourceMetadata extends Pick<WikiResourceHistory, 'createdAt' | 'creatorId' | 'creatorName' | 'updatedAt'> {
  /** The id of the wiki (`_id` of the API). */
  assetId: string;
  name: string;
  thumbnail?: string;
}

/** A wiki, with its pages in the order of its tree (`arrangeWikiPages`). */
export interface Wiki extends WikiResourceMetadata {
  description?: string;
  pages: WikiPageMetaData[];
  /** The rights of the user on the wiki (`computeRights`): `creator`, `manager`, `comment`… */
  rights: string[];
}

/** A page of a wiki, placed in the tree of the wiki. */
export interface WikiPageMetaData {
  id: string;
  isVisible: boolean;
  title: string;
  position: number;
  /** Its level in the tree: 0 for a page at the top. */
  depth: number;
  parentId?: WikiPageMetaData['id'];
  /** Its children, by position. */
  childrenIds: WikiPageMetaData['id'][];
}

/** A page as the server gives it, before it is placed in the tree of the wiki (`orderWikiPages`). */
export type WikiPageNode = Omit<WikiPageMetaData, 'depth'>;

/** A wiki as the service gives it: its pages are not yet ordered nor filtered (`arrangeWikiPages`). */
export type WikiWithPageNodes = Omit<Wiki, 'pages'> & { pages: WikiPageNode[] };

export interface WikiPage extends Pick<WikiPageMetaData, 'id' | 'isVisible' | 'title'>, WikiResourceHistory {
  content: string;
  contentVersion: number;
  comments: CommentsThread.AnyCommentItem[];
}
