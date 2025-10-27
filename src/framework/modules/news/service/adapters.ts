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

export const newsItemAdapter = (n: BackendNewsItem) => {
  const ret = {
    content: n.content,
    created: moment(n.created),
    expirationDate: n.expirationDate ? moment(n.expirationDate) : null,
    headline: n.headline,
    id: n.id,
    modified: moment(n.modified),
    numberOfComments: n.numberOfComments,
    owner: {
      deleted: n.owner.deleted,
      displayName: n.owner.displayName,
      id: n.owner.id,
    },
    publicationDate: n.publicationDate ? moment(n.publicationDate) : null,
    sharedRights: n.sharedRights as NewsItemRights[],
    status: n.status as NewsItemStatus,
    threadId: n.threadId,
    title: n.title,
  };
  return ret as NewsItem;
};

export const newsItemDetailsAdapter = (n: BackendNewsItemDetails) => {
  const ret = {
    news: {
      content: n.content,
      created: moment(n.created),
      expirationDate: n.expirationDate ? moment(n.expirationDate) : null,
      headline: n.headline,
      id: n.id,
      modified: moment(n.modified),
      numberOfComments: n.numberOfComments,
      owner: {
        deleted: n.owner.deleted,
        displayName: n.owner.displayName,
        id: n.owner.id,
      },
      publicationDate: n.publicationDate ? moment(n.publicationDate) : null,
      sharedRights: n.sharedRights as NewsItemRights[],
      status: n.status as NewsItemStatus,
      threadId: n.thread.id,
      title: n.title,
    },
    thread: {
      icon: n.thread.icon,
      ownerId: n.thread.owner.id,
      sharedRights: n.thread.sharedRights as NewsThreadItemRights[],
      title: n.thread.title,
    },
  };
  return ret as NewsItemDetails;
};

export const newsThreadItemAdapter = (n: BackendNewsThreadItem) => {
  const ret = {
    created: moment(n.created),
    icon: n.icon ? { uri: n.icon } : null,
    id: n.id,
    modified: moment(n.created),
    owner: {
      deleted: n.owner.deleted,
      displayName: n.owner.displayName,
      id: n.owner.id,
    },
    sharedRights: n.sharedRights as NewsThreadItemRights[],
    title: n.title,
  };
  return ret as NewsThreadItem;
};

export const newsCommentItemAdapter = (n: BackendNewsCommentItem) => {
  const ret = {
    comment: n.comment,
    created: moment(n.created),
    id: n._id,
    infoId: n.info_id,
    modified: moment(n.modified),
    owner: n.owner,
    username: n.username,
  };
  return ret as NewsCommentItem;
};
