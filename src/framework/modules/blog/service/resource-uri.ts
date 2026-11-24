/**
 * Link between a resource of `blog` (a blog, a post) and its address in the web app: from the address to the resource (capture), and
 * from the resource to the address (generate). Used by the notifications, the resources opened and the audience.
 */
import type { BlogPostIds } from '~/framework/modules/blog/model';
import type { IResourceUriCaptureFunction } from '~/framework/util/notifications';

/** The blog, and the post if any, of the address of a blog or of a post. */
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

/** The address of a post. */
export const blogPostGenerateResourceUriFunction = ({ blogId, postId }: BlogPostIds) => {
  return `/blog#/detail/${blogId}/${postId}`;
};
