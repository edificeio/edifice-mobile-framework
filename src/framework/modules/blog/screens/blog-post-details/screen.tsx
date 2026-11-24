/**
 * A post of a blog, with its comments (`comments`): comment and reply, publish a submitted post, change or delete the post.
 */
import * as React from 'react';
import { Alert, ScrollViewProps } from 'react-native';

import type { StaticScreenProps } from '@react-navigation/native';

import { defineScreen, headerMenu, headerRightActions, menuAction, useNavigation } from '~/app/navigation-new';
import { BottomButtonSheet } from '~/framework/components/BottomButtonSheet';
import { BottomSheet } from '~/framework/components/BottomSheet';
import { SmallBoldText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { ContentLoader, type ContentLoaderHandle } from '~/framework/hooks/loader';
import { deleteBlogPost, publishBlogPost } from '~/framework/modules/blog/actions';
import BlogPostDetails from '~/framework/modules/blog/components/blog-post-details';
import BlogPlaceholderDetails from '~/framework/modules/blog/components/placeholder/details';
import type { Blog, BlogPostDetails as BlogPostDetailsData, BlogPostIds } from '~/framework/modules/blog/model';
import { computeCanComment, hasPermissionManager, publishBlogPostResourceRight } from '~/framework/modules/blog/model/business';
import { ResourceWithCommentsTemplate } from '~/framework/modules/comments';
import { resourceHasRight } from '~/framework/util/resourceRights';
import { withSession } from '~/modules/auth/hoc';
import type { AuthActiveAccount } from '~/modules/auth/model';
import { I18n } from '~/util/i18n';

import { useBlogPostComments, useBlogPostDetails, useOnFocusBack } from './hooks';
import styles from './styles';
import type { BlogPostDetailsScreenNavParams } from './types';

/** The post loaded: its header (title, menu), its content and its comments. */
function BlogPostDetailsScreenLoaded({
  blog,
  ids,
  post,
  refreshControl,
  reload,
  session,
}: {
  blog: Blog;
  ids: BlogPostIds;
  post: BlogPostDetailsData;
  refreshControl: ScrollViewProps['refreshControl'];
  /** Loads the post again, without indicator. Throws if it fails. */
  reload: () => Promise<BlogPostDetailsData>;
  session: AuthActiveAccount;
}) {
  const navigation = useNavigation();
  const { deleteComment, focusedComment, submitComment, updateComment } = useBlogPostComments(session, ids, reload);

  const deletePost = React.useCallback(async () => {
    try {
      await deleteBlogPost(session, ids);
    } catch (e) {
      console.error('[BlogPostDetailsScreen] failed to delete the post', e);
      Alert.alert(I18n.get('blog-postdetails-error-title'), I18n.get('blog-postdetails-error-text'));
      return;
    }
    // Back to the list under the post (`pop`), not a new one on top of the deleted post
    navigation.navigate('blog/list', { blogId: ids.blogId, forceReload: true }, { pop: true });
  }, [ids, navigation, session]);

  // The title is the one of the post, and the menu depends on the rights on the post
  const canManagePost = hasPermissionManager(blog, session) || post.author.userId === session.user.id;
  React.useLayoutEffect(() => {
    const menuData = canManagePost
      ? [
          menuAction({
            icon: { android: 'ic_edit', ios: { name: 'pencil', type: 'sfSymbol' } },
            label: I18n.get('common-edit'),
            onPress: () =>
              navigation.navigate('blog/edit', {
                blog,
                content: post.content,
                postId: post._id,
                postState: post.state,
                title: post.title,
              }),
            testID: 'blog-postdetails-edit',
          }),
          menuAction({
            destructive: true,
            icon: { android: 'ic_delete_item', ios: { name: 'trash', type: 'sfSymbol' } },
            label: I18n.get('common-delete'),
            onPress: () =>
              Alert.alert(I18n.get('blog-postdetails-deletion-title'), I18n.get('blog-postdetails-deletion-text'), [
                { style: 'default', text: I18n.get('common-cancel') },
                { onPress: deletePost, style: 'destructive', text: I18n.get('common-delete') },
              ]),
            testID: 'blog-postdetails-delete',
          }),
        ]
      : [];

    navigation.setOptions({
      ...headerRightActions(
        ...(menuData.length
          ? [
              headerMenu({
                icon: { android: 'ui-options', ios: { name: 'ellipsis', type: 'sfSymbol' } },
                items: menuData,
                // ToDo(blog-migration): a translation of « options » for screen readers (none in the app yet)
                label: I18n.get('common-edit'),
                testID: 'blog-postdetails-options',
              }),
            ]
          : []),
      ),
      // The title of the post replaces the empty one of the options
      headerTitle: undefined,
      title: post.title,
    });
  }, [blog, canManagePost, deletePost, navigation, post]);

  const publishPost = React.useCallback(async () => {
    try {
      await publishBlogPost(session, ids);
    } catch (e) {
      console.error('[BlogPostDetailsScreen] failed to publish the post', e);
      Toast.showError(I18n.get('blog-postdetails-error-text'));
      return;
    }
    Toast.showSuccess(I18n.get('blog-postdetails-publish-success'));
    // Published: the post shown is reloaded (an error leaves it as it is, until the next refresh)
    try {
      await reload();
    } catch (e) {
      console.error('[BlogPostDetailsScreen] failed to reload the post', e);
    }
  }, [ids, reload, session]);

  const hasPublishBlogPostRight = resourceHasRight(blog, publishBlogPostResourceRight, session);
  const renderFooter = React.useCallback(() => {
    if (post.state !== 'SUBMITTED') return null;
    return hasPublishBlogPostRight ? (
      <BottomButtonSheet text={I18n.get('blog-postdetails-publish')} action={publishPost} />
    ) : (
      <BottomSheet
        content={
          <SmallBoldText style={styles.footerWaitingValidation}>{I18n.get('blog-postdetails-waitingvalidation')}</SmallBoldText>
        }
      />
    );
  }, [hasPublishBlogPostRight, post.state, publishPost]);

  const canAddComment = React.useMemo(() => computeCanComment(blog, session), [blog, session]);

  return (
    <ResourceWithCommentsTemplate
      alwaysShowCommentField
      canAddReply={blog.allowReplies}
      canAddComment={canAddComment}
      data={post.commentsThread}
      onSubmit={submitComment}
      onEdit={updateComment}
      focusItem={focusedComment}
      onDelete={deleteComment}
      refreshControl={refreshControl}
      ListHeaderComponent={<BlogPostDetails blog={blog} post={post} session={session} />}
      ListFooterComponent={renderFooter}
    />
  );
}

const BlogPostDetailsScreen = withSession<StaticScreenProps<BlogPostDetailsScreenNavParams>>(function ({ route, session }) {
  const navigation = useNavigation();
  const { blogId, postId } = route.params;
  const ids = React.useMemo(() => ({ blogId, postId }), [blogId, postId]);
  const loaderRef = React.useRef<ContentLoaderHandle>(null);
  const { blog, loadContent, post } = useBlogPostDetails(session, ids);

  // Reloaded when the screen comes back (from the change of the post, from another screen)
  useOnFocusBack(navigation, () => loaderRef.current?.refreshSilent());

  const renderContent = React.useCallback(
    (refreshControl: ScrollViewProps['refreshControl']) =>
      blog && post ? (
        <BlogPostDetailsScreenLoaded
          blog={blog}
          ids={ids}
          post={post}
          refreshControl={refreshControl}
          reload={loadContent}
          session={session}
        />
      ) : (
        <BlogPlaceholderDetails />
      ),
    [blog, ids, loadContent, post, session],
  );

  return (
    <ContentLoader
      // Another post asked by the params (a notification on the screen already in the stack): it is opened again
      key={`${blogId}/${postId}`}
      ref={loaderRef}
      loadContent={loadContent}
      renderContent={renderContent}
      renderLoading={BlogPlaceholderDetails}
    />
  );
});
BlogPostDetailsScreen.displayName = 'BlogPostDetailsScreen';

export default defineScreen({
  // The title of the post is set by the screen once loaded: hidden until then (`title: ''` would show the name of the route)
  options: () => ({ headerTitle: () => '', title: '' }),
  screen: BlogPostDetailsScreen,
});
