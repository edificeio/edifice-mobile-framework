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
}

export interface BackendNewsItemDetails extends Omit<BackendNewsItem, 'threadId'> {
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
  sharedRights: string[];
}

export interface BackendNewsCommentItem {
  _id: number;
  comment: string;
  owner: string;
  created: string;
  modified: string;
  username: string;
  info_id: number;
}
