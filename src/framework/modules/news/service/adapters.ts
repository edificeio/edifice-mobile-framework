import moment from 'moment';

import {
  NewsCommentItem,
  NewsItem,
  NewsItemDetails,
  NewsItemRights,
  NewsItemStatus,
  NewsThreadItem,
  NewsThreadItemRights,
} from '~/framework/modules/news/model';
import {
  BackendNewsCommentItem,
  BackendNewsItem,
  BackendNewsItemDetails,
  BackendNewsThreadItem,
} from '~/framework/modules/news/service/types';

/** Allows us to map owner properties */
const mapOwnerProperties = (owner: { deleted: boolean; displayName: string; id: string }) => ({
  deleted: owner.deleted,
  displayName: owner.displayName,
  id: owner.id,
});

/** Mapping common news item properties */
const mapCommonNewsItemProperties = (n: BackendNewsItem | BackendNewsItemDetails) => ({
  content: n.content,
  created: moment(n.created),
  expirationDate: n.expirationDate ? moment(n.expirationDate) : null,
  headline: n.headline,
  id: n.id,
  modified: moment(n.modified),
  numberOfComments: n.numberOfComments,
  owner: mapOwnerProperties(n.owner),
  publicationDate: n.publicationDate ? moment(n.publicationDate) : null,
  sharedRights: n.sharedRights as NewsItemRights[],
  status: n.status as NewsItemStatus,
  title: n.title,
});

export const newsItemAdapter = (n: BackendNewsItem) => {
  return {
    ...mapCommonNewsItemProperties(n),
    threadId: n.threadId,
  } as NewsItem;
};

export const newsItemDetailsAdapter = (n: BackendNewsItemDetails) => {
  return {
    news: {
      ...mapCommonNewsItemProperties(n),
      threadId: n.thread.id,
    },
    thread: {
      icon: n.thread.icon,
      ownerId: n.thread.owner.id,
      sharedRights: n.thread.sharedRights as NewsThreadItemRights[],
      title: n.thread.title,
    },
  } as NewsItemDetails;
};

export const newsThreadItemAdapter = (n: BackendNewsThreadItem) => {
  return {
    created: moment(n.created),
    icon: n.icon ? { uri: n.icon } : null,
    id: n.id,
    modified: moment(n.created),
    owner: mapOwnerProperties(n.owner),
    sharedRights: n.sharedRights as NewsThreadItemRights[],
    title: n.title,
  } as NewsThreadItem;
};

export const newsCommentItemAdapter = (n: BackendNewsCommentItem) => {
  return {
    comment: n.comment,
    created: moment(n.created),
    id: n._id,
    infoId: n.info_id,
    modified: moment(n.modified),
    owner: n.owner,
    username: n.username,
  } as NewsCommentItem;
};
