import { NewsOwner } from '~/framework/modules/news/model';

export interface BackendNewsItem {
  id: number;
  threadId: number;
  content: string;
  status: string;
  owner: NewsOwner;
  created: string;
  modified: string;
  publicationDate: string | null;
  expirationDate: string | null;
  numberOfComments: number;
  title: string;
  headline: boolean;
  sharedRights: string[];
  viewed: boolean;
}

export interface BackendNewsItemDetails extends Omit<BackendNewsItem, 'threadId'> {
  contentVersion: number;
  thread: {
    id: number;
    title: string;
    icon: string;
    owner: NewsOwner;
    sharedRights: string[];
  };
}

export interface BackendNewsThreadItem {
  title: string;
  id: number;
  icon: string | null;
  created: string;
  modified: string;
  owner: NewsOwner;
  structureId: string;
  structure: { id: string; name: string };
  sharedRights: string[];
  visible: boolean;
}

export interface BackendNewsCommentItem {
  _id: number;
  comment: string;
  owner: string;
  created: string;
  modified: string;
  username: string;
  deleted: boolean;
  info_id: number;
}
