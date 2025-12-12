import moment from 'moment';

import { IEntcoreBlog, IEntcoreBlogFolder, IEntcoreBlogPost, IEntcoreBlogPostBaseAuthor, IEntcoreBlogPostComments } from './types';

import { Blog, BlogFolder, BlogPost, BlogPostComment, BlogPostComments } from '~/framework/modules/blog/reducer';
import { IResourceUriCaptureFunction } from '~/framework/util/notifications';

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

export const blogAdapter = (blog: IEntcoreBlog) => {
  const ret = {
    'author': mapBlogPostAuthor(blog.author),
    'comment-type': blog['comment-type'],
    'created': moment(blog.created.$date),
    'description': blog.description,
    'fetchPosts': blog.fetchPosts?.map(bp => blogFetchPostAdapter(bp)),
    'id': blog._id,
    'modified': moment(blog.modified.$date),
    'publish-type': blog['publish-type'],
    'shared': blog.shared,
    'thumbnail': blog.thumbnail,
    'title': blog.title,
    'trashed': blog.trashed,
    'visibility': blog.visibility,
  };
  return ret as Blog;
};

export const blogPostCommentsAdapter = (blogPostComments: IEntcoreBlogPostComments) => {
  const ret = blogPostComments.map(blogPostComment => {
    const adaptedBlogPostComment: BlogPostComment = {
      ...blogPostComment,
      created: moment(blogPostComment.created.$date),
      modified: blogPostComment.modified ? moment(blogPostComment.modified.$date) : undefined,
    };
    return adaptedBlogPostComment;
  });
  return ret as BlogPostComments;
};

export const blogPostAdapter = (blogPost: IEntcoreBlogPost) => {
  const ret = {
    _id: blogPost._id,
    author: mapBlogPostAuthor(blogPost.author),
    comments: blogPost.comments && blogPostCommentsAdapter(blogPost.comments),
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
