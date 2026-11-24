/**
 * Hooks of the screen of a post: its loading, its reloading when the screen comes back, and what the user does on its comments.
 */
import * as React from 'react';
import { Alert } from 'react-native';

import {
  deleteBlogPostComment,
  loadBlogPostAudience,
  loadBlogPostDetails,
  publishBlogPostComment,
  updateBlogPostComment,
} from '~/framework/modules/blog/actions';
import type { Blog, BlogPostDetails, BlogPostIds } from '~/framework/modules/blog/model';
import { blogService } from '~/framework/modules/blog/service';
import type { CommentsTreeProps } from '~/framework/modules/comments/components/comments-tree';
import { markViewAudience } from '~/modules/audience/actions';
import { refreshOneSessionId } from '~/modules/auth/flows';
import type { AuthActiveAccount } from '~/modules/auth/model';
import { I18n } from '~/util/i18n';

/** The audience of a post, or nothing if it can't be loaded: the post is shown anyway. */
const loadAudienceOrNothing = async (postId: string) => {
  try {
    return await loadBlogPostAudience(postId);
  } catch (e) {
    console.error('[BlogPostDetailsScreen] failed to load the audience', e);
    return undefined;
  }
};

/**
 * The blog and the post shown, with its comments and its audience. `loadContent` loads them (`ContentLoader`), and gives the post
 * loaded; it throws if it fails. The view of a post is marked once (`audience`), at its first loading.
 */
export const useBlogPostDetails = (session: AuthActiveAccount, { blogId, postId }: BlogPostIds) => {
  const [blog, setBlog] = React.useState<Blog | undefined>(undefined);
  const [post, setPost] = React.useState<BlogPostDetails | undefined>(undefined);
  const viewMarkedPostIdRef = React.useRef<string | undefined>(undefined);

  const loadContent = React.useCallback(async () => {
    // The images of the content need a session id
    await refreshOneSessionId(session);
    const [newBlog, newPost, audience] = await Promise.all([
      blogService.get(session, blogId),
      loadBlogPostDetails(session, { blogId, postId }),
      loadAudienceOrNothing(postId),
    ]);
    const newPostWithAudience = { ...newPost, audience };
    setBlog(newBlog);
    setPost(newPostWithAudience);
    if (viewMarkedPostIdRef.current !== postId) {
      viewMarkedPostIdRef.current = postId;
      markViewAudience({ module: 'blog', resourceId: postId, resourceType: 'post' });
    }
    return newPostWithAudience;
  }, [blogId, postId, session]);

  return { blog, loadContent, post };
};

/** Calls `onBack` when the screen comes back (`focus` after a `blur`): not when it opens. */
export const useOnFocusBack = (
  navigation: { addListener: (event: 'focus' | 'blur', callback: () => void) => () => void },
  onBack: () => void,
) => {
  const onBackRef = React.useRef(onBack);
  onBackRef.current = onBack;
  React.useEffect(() => {
    let blurred = false;
    const unsubscribeBlur = navigation.addListener('blur', () => {
      blurred = true;
    });
    const unsubscribeFocus = navigation.addListener('focus', () => {
      if (!blurred) return;
      blurred = false;
      onBackRef.current();
    });
    return () => {
      unsubscribeBlur();
      unsubscribeFocus();
    };
  }, [navigation]);
};

const alertError = () => Alert.alert(I18n.get('blog-postdetails-error-title'), I18n.get('blog-postdetails-error-text'));

/**
 * What the user does on the comments of a post (`comments`): publish a comment or a reply, change or delete one. Each reloads the
 * post (`reload`). `focusedComment`: the comment to scroll to, the one published (or replied to).
 *
 * Publishing or changing a comment throws if it fails: the form of `comments` then keeps the text typed and shows the error. Done,
 * a failure to reload is only logged: the comment is saved, and shows at the next refresh (no error that would make it sent again).
 * Deleting one shows an alert if it fails.
 */
export const useBlogPostComments = (session: AuthActiveAccount, ids: BlogPostIds, reload: () => Promise<BlogPostDetails>) => {
  const [focusedComment, setFocusedComment] = React.useState<string | undefined>(undefined);

  const submitComment = React.useCallback<NonNullable<CommentsTreeProps['onSubmit']>>(
    async (comment, replyTo) => {
      try {
        await publishBlogPostComment(session, ids, comment.content, replyTo);
      } catch (e) {
        console.error('[BlogPostDetailsScreen] failed to publish the comment', e);
        throw e;
      }
      try {
        const newPost = await reload();
        // The most recent comment comes first
        setFocusedComment(replyTo ?? newPost.commentsThread[0]?.id);
      } catch (e) {
        console.error('[BlogPostDetailsScreen] failed to reload the post', e);
      }
    },
    [ids, reload, session],
  );

  const updateComment = React.useCallback<NonNullable<CommentsTreeProps['onEdit']>>(
    async (comment, commentId) => {
      try {
        await updateBlogPostComment(session, { ...ids, commentId }, comment.content);
      } catch (e) {
        console.error('[BlogPostDetailsScreen] failed to change the comment', e);
        throw e;
      }
      try {
        await reload();
      } catch (e) {
        console.error('[BlogPostDetailsScreen] failed to reload the post', e);
      }
    },
    [ids, reload, session],
  );

  const deleteComment = React.useCallback<NonNullable<CommentsTreeProps['onDelete']>>(
    async commentId => {
      try {
        await deleteBlogPostComment(session, { ...ids, commentId });
        await reload();
      } catch (e) {
        console.error('[BlogPostDetailsScreen] failed to delete the comment', e);
        alertError();
      }
    },
    [ids, reload, session],
  );

  return { deleteComment, focusedComment, submitComment, updateComment };
};
