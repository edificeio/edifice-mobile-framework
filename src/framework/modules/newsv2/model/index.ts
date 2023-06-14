import { Moment } from 'moment';
import { ImageSourcePropType } from 'react-native';

export interface NewsOwner {
  id: string;
  displayName: string;
  deleted: boolean;
}

export enum NewsThreadItemRights {
  MANAGER = 'thread.manager',
  PUBLISH = 'thread.publish',
  CONTRIBUTOR = 'thread.contrib',
}

export interface NewsThreadItem {
  title: string;
  id: number;
  icon: ImageSourcePropType | null;
  created: Moment;
  modified: Moment;
  owner: NewsOwner;
  rights: NewsThreadItemRights[];
}

export enum NewsItemRights {
  READ = 'info.read',
  COMMENT = 'info.comment',
}

export enum NewsItemStatus {
  PUBLISHED = 'PUBLISHED',
  PENDING = 'PENDING',
  TRASH = 'TRASH',
  DRAFT = 'DRAFT',
}

export interface NewsItem {
  id: number;
  threadId: number;
  content: string;
  status: NewsItemStatus;
  owner: NewsOwner;
  created: Moment;
  modified: Moment;
  publicationDate: Moment | null;
  expirationDate: Moment | null;
  numberOfComments: number;
  title: string;
  headline: boolean;
  rights: NewsItemRights[];
}

export interface NewsItemDetails extends Omit<NewsItem, 'threadId'> {
  thread: {
    id: number;
    title: string;
    icon: string;
    rights: NewsThreadItemRights[];
  };
}

export interface NewsCommentItem {
  id: number;
  infoId: number;
  comment: string;
  owner: string;
  created: Moment;
  modified: Moment;
  username: string;
}
