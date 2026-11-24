/**
 * API of `blog`. It takes and gives types of the model (see `adapter.ts`).
 * Every call is signed with the account given (`accountFetch`): the session of the screen.
 */
import type {
  Blog,
  BlogList,
  BlogPost,
  BlogPostCommentIds,
  BlogPostComments,
  BlogPostCounts,
  BlogPostIds,
} from '~/framework/modules/blog/model';
import { getModuleTransport } from '~/framework/util/transport';
import type { AccountType, AuthActiveAccount } from '~/modules/auth/model';

import { toAccountType, toBlog, toBlogPost, toBlogPostComments, toCommentBody, toPostBody } from './adapter';
import type { API } from './types';

// Typed with the scopes of the module (`getModuleTransport`): `/blog/...`, and `/userbook/...` for the authors of the comments
const transport = getModuleTransport('blog');

/** The states of posts asked, for a list of posts. */
const statesQuery = (state?: string | string[]) => {
  const states = typeof state === 'string' ? [state] : state;
  return states ? `&states=${states.join(',')}` : '';
};

export const blogService = {
  /**
   * The types of account of users (`userId` → type), for the authors of the comments: the comments of the server don't give them.
   * `undefined` for a user not found.
   */
  accountTypes: async (session: AuthActiveAccount, userIds: string[]): Promise<Partial<Record<string, AccountType>>> =>
    Object.fromEntries(
      await Promise.all(
        userIds.map(
          async userId =>
            [
              userId,
              toAccountType(await transport.accountFetch.json<API.PersonResponse>(session, `/userbook/api/person?id=${userId}`)),
            ] as const,
        ),
      ),
    ),

  comments: {
    delete: async (session: AuthActiveAccount, { blogId, commentId, postId }: BlogPostCommentIds) => {
      await transport.accountFetch.json(session, `/blog/comment/${blogId}/${postId}/${commentId}`, { method: 'DELETE' });
    },
    get: async (session: AuthActiveAccount, { blogId, postId }: BlogPostIds): Promise<BlogPostComments> =>
      toBlogPostComments(await transport.accountFetch.json<API.Comment[]>(session, `/blog/comments/${blogId}/${postId}`)),
    /** Publishes a comment, or a reply to the comment `replyTo`. */
    publish: async (session: AuthActiveAccount, { blogId, postId }: BlogPostIds, comment: string, replyTo?: string) => {
      await transport.accountFetch.json(session, `/blog/comment/${blogId}/${postId}`, {
        body: JSON.stringify(toCommentBody(comment, replyTo)),
        method: 'POST',
      });
    },
    update: async (session: AuthActiveAccount, { blogId, commentId, postId }: BlogPostCommentIds, comment: string) => {
      await transport.accountFetch.json(session, `/blog/comment/${blogId}/${postId}/${commentId}`, {
        body: JSON.stringify(toCommentBody(comment)),
        method: 'PUT',
      });
    },
  },

  get: async (session: AuthActiveAccount, blogId: string): Promise<Blog> =>
    toBlog(await transport.accountFetch.json<API.Blog>(session, `/blog/${blogId}`)),

  /** The blogs of the user, out of the trash. */
  list: async (session: AuthActiveAccount): Promise<BlogList> => {
    const blogs = await transport.accountFetch.json<API.Blog[]>(session, '/blog/list/all');
    return blogs.filter(blog => !blog.trashed).map(toBlog);
  },

  post: {
    /** Creates a post (a draft). @returns its id. */
    create: async (session: AuthActiveAccount, blogId: string, postTitle: string, postContentHtml: string) => {
      const createdPost = await transport.accountFetch.json<API.CreatedBlogPost>(session, `/blog/post/${blogId}`, {
        body: JSON.stringify(toPostBody(postTitle, postContentHtml)),
        method: 'POST',
      });
      return createdPost._id;
    },
    delete: async (session: AuthActiveAccount, { blogId, postId }: BlogPostIds) => {
      await transport.accountFetch(session, `/blog/post/${blogId}/${postId}`, { method: 'DELETE' });
    },
    edit: async (session: AuthActiveAccount, blogId: string, postId: string, postTitle: string, postContentHtml: string) => {
      await transport.accountFetch.json(session, `/blog/post/${blogId}/${postId}`, {
        body: JSON.stringify(toPostBody(postTitle, postContentHtml)),
        method: 'PUT',
      });
    },
    /** A post, in a state (`PUBLISHED`…). Without state, it is read first from the list of the posts of the blog. */
    get: async (session: AuthActiveAccount, { blogId, postId }: BlogPostIds, state?: string): Promise<BlogPost> => {
      if (!state) {
        const metadata = await transport.accountFetch.json<API.BlogPost[]>(
          session,
          `/blog/post/list/all/${blogId}?postId=${postId}`,
        );
        state = metadata[0].state;
      }
      const query = state ? `?state=${state}` : '';
      return toBlogPost(await transport.accountFetch.json<API.BlogPost>(session, `/blog/post/${blogId}/${postId}${query}`));
    },
    publish: async (session: AuthActiveAccount, blogId: string, postId: string) => {
      await transport.accountFetch.json(session, `/blog/post/publish/${blogId}/${postId}`, { method: 'PUT' });
    },
    submit: async (session: AuthActiveAccount, blogId: string, postId: string) => {
      await transport.accountFetch.json(session, `/blog/post/submit/${blogId}/${postId}`, { method: 'PUT' });
    },
  },

  posts: {
    /** A page of the posts of a blog, with their content, in the states asked. */
    page: async (session: AuthActiveAccount, blogId: string, page: number, size: number, state?: string | string[]) => {
      const posts = await transport.accountFetch.json<API.BlogPost[]>(
        session,
        `/blog/post/list/all/${blogId}?content=true&page=${page}&pageSize=${size}${statesQuery(state)}`,
      );
      return posts.map(toBlogPost);
    },
    total: async (session: AuthActiveAccount, blogId: string): Promise<BlogPostCounts> =>
      transport.accountFetch.json<API.PostCountsResponse>(session, `/blog/counter/${blogId}`),
  },
};
