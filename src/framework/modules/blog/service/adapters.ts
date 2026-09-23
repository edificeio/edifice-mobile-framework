import { Temporal } from '@js-temporal/polyfill';
import moment from 'moment';

import { AccountType } from '~/framework/modules/auth/model';
import { Blog, BlogFolder, BlogPost } from '~/framework/modules/blog/reducer';
import { CommentsThreadProps } from '~/framework/modules/comments/components/comments-thread';
import * as CommentsThread from '~/framework/modules/comments/types';
import { IResourceUriCaptureFunction } from '~/framework/util/notifications';
import { sessionFetch } from '~/framework/util/transport';

import { IEntcoreBlog, IEntcoreBlogFolder, IEntcoreBlogPost, IEntcoreBlogPostBaseAuthor, IEntcoreBlogPostComments } from './types';

const mapBlogPostAuthor = (author: IEntcoreBlogPostBaseAuthor) => ({
  login: author.login,
  userId: author.userId,
  username: author.username,
});

export const blogFetchPostAdapter = (blogPost: Omit<IEntcoreBlogPost, 'content'>) => {
  const ret = {
    _id: blogPost._id,
    author: mapBlogPostAuthor(blogPost.author),
    created: moment(blogPost.created.$date),
    firstPublishDate: blogPost.firstPublishDate?.$date && moment(blogPost.firstPublishDate.$date),
    modified: moment(blogPost.modified.$date),
    state: blogPost.state,
    title: blogPost.title,
    views: blogPost.views,
  };
  return ret as Omit<BlogPost, 'content'>;
};

export const blogAdapter = (blog: IEntcoreBlog): Blog => {
  const ret = {
    'allowReplies': blog.allowReplies,
    'author': mapBlogPostAuthor(blog.author),
    'comment-type': blog['comment-type'],
    'created': moment(blog.created.$date),
    'description': blog.description,
    'fetchPosts': blog.fetchPosts?.map(bp => blogFetchPostAdapter(bp)),
    'id': blog._id,
    'modified': moment(blog.modified.$date),
    'publish-type': blog['publish-type'],
    'rights': blog.rights,
    'shared': blog.shared,
    'thumbnail': blog.thumbnail,
    'title': blog.title,
    'trashed': blog.trashed,
    'visibility': blog.visibility,
  };
  return ret;
};

export const blogPostAdapter = (blogPost: IEntcoreBlogPost) => {
  const ret = {
    _id: blogPost._id,
    author: mapBlogPostAuthor(blogPost.author),
    content: blogPost.content,
    created: moment(blogPost.created.$date),
    firstPublishDate: blogPost.firstPublishDate && moment(blogPost.firstPublishDate.$date),
    modified: moment(blogPost.modified.$date),
    state: blogPost.state,
    title: blogPost.title,
    views: blogPost.views,
  };
  return ret as BlogPost;
};

export const blogFolderAdapter = (blogFolder: IEntcoreBlogFolder) => {
  return {
    ...blogFolder,
    created: moment(blogFolder.created.$date),
    id: blogFolder._id,
    modified: moment(blogFolder.created.$date),
    resourceIds: blogFolder.ressourceIds,
  } as BlogFolder;
};

export const blogUriCaptureFunction: IResourceUriCaptureFunction<{ blogId: string; postId: string }> = url => {
  const blogPostIdRegex = /^\/blog.+\/([a-z0-9-]{36})\/([a-z0-9-]{36})\/?/;
  const blogIdRegex = /^\/blog.+\/([a-z0-9-]{36})\/?/;
  const blogPostIdMatch = url.match(blogPostIdRegex);
  return !blogPostIdMatch
    ? {
        blogId: url.match(blogIdRegex)?.[1],
      }
    : {
        blogId: blogPostIdMatch?.[1],
        postId: blogPostIdMatch?.[2],
      };
};
export const blogPostGenerateResourceUriFunction = ({ blogId, postId }: { blogId: string; postId: string }) => {
  return `/blog#/detail/${blogId}/${postId}`;
};

const parseAccountTypesMap = {
  External: AccountType.External,
  Guest: AccountType.Guest,
  Personnel: AccountType.Personnel,
  Relative: AccountType.Relative,
  Student: AccountType.Student,
  Teacher: AccountType.Teacher,
} as const;

export const hydratePostComments = async (data: IEntcoreBlogPostComments = []): Promise<CommentsThreadProps['data']> => {
  // 1. Fetch fucking account type for each author because backend does not provide them by itself.
  const authors = new Set<
    (
      | CommentsThread.CommentItem
      | CommentsThread.ReplyItem
      | CommentsThread.CommentDeletedItem
      | CommentsThread.ReplyDeletedItem
    )['authorId']
  >();
  for (const item of data) {
    if ('author' in item) authors.add(item.author.userId);
  }
  const userTypes = Object.fromEntries(
    await Promise.all(
      [...authors].map(async authorId => {
        const userData = await sessionFetch.json<{
          status: 'ok';
          result: Record<string, { type: (keyof typeof parseAccountTypesMap)[] }>;
        }>(`/userbook/api/person?id=${authorId}`);
        return [authorId, parseAccountTypesMap[userData.result[0]?.type[0]] ?? undefined] as const;
      }),
    ),
  );

  // 2. Prepare parsed data arrays.
  const parsedComments: Record<
    (CommentsThread.CommentItem | CommentsThread.CommentDeletedItem)['id'],
    Omit<CommentsThread.CommentItem | CommentsThread.CommentDeletedItem, 'replies'>
  > = {};
  const parsedReplies: Record<
    (CommentsThread.CommentItem | CommentsThread.CommentDeletedItem)['id'],
    (CommentsThread.ReplyItem | CommentsThread.ReplyDeletedItem)[]
  > = {};

  // 3. Parse data
  for (const item of data) {
    const ret: Pick<
      CommentsThread.CommentItem | CommentsThread.CommentDeletedItem | CommentsThread.ReplyItem | CommentsThread.ReplyDeletedItem,
      'id' | 'date'
    > &
      Partial<
        Pick<
          CommentsThread.CommentItem | CommentsThread.ReplyItem,
          'authorAccountType' | 'authorId' | 'authorName' | 'content' | 'isRichContent'
        >
      > &
      Partial<Pick<CommentsThread.CommentDeletedItem | CommentsThread.ReplyDeletedItem, 'deleted'>> = {
      date: Temporal.Instant.from(item.created.$date),
      id: item.id,
    };
    if (!('deleted' in item)) {
      ret.authorId = item.author.userId;
      ret.authorName = item.author.username;
      ret.authorAccountType = userTypes[item.author.userId] ?? AccountType.Guest; // use guest if user is not found... Don't known what to do.
      ret.content = item.comment;
      ret.isRichContent = false;
    } else {
      ret.deleted = true;
    }

    if ('replyTo' in item && item.replyTo) {
      if (!(item.replyTo in parsedReplies)) parsedReplies[item.replyTo] = [];
      parsedReplies[item.replyTo].push(ret as CommentsThread.ReplyItem | CommentsThread.ReplyDeletedItem);
    } else {
      parsedComments[ret.id] = ret as CommentsThread.CommentItem | CommentsThread.CommentDeletedItem;
    }
  }

  // 4. Compose & sort data
  const sortedComments = Object.values(parsedComments).sort((a, b) => Temporal.Instant.compare(b.date, a.date)); // comments are in reverse-ordrer
  for (const comment of sortedComments) {
    (comment as CommentsThread.CommentItem | CommentsThread.CommentDeletedItem).replies =
      comment.id in parsedReplies ? parsedReplies[comment.id].sort((a, b) => Temporal.Instant.compare(a.date, b.date)) : [];
  }

  return sortedComments as (CommentsThread.CommentItem | CommentsThread.CommentDeletedItem)[];
};
