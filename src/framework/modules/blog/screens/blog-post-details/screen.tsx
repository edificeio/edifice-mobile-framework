import * as React from 'react';
import { Alert, FlatListProps } from 'react-native';

import { connect, useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import { IGlobalState } from '~/app/store';
import { BottomButtonSheet } from '~/framework/components/BottomButtonSheet';
import { BottomSheet } from '~/framework/components/BottomSheet';
import { deleteAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import { NavBarAction } from '~/framework/components/navigation';
import { SmallBoldText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
import { useAudience } from '~/framework/modules/audience';
import { audienceService } from '~/framework/modules/audience/service';
import { refreshSessionIdForAccountAction } from '~/framework/modules/auth/thunks';
import { withSession } from '~/framework/modules/auth/util';
import {
  deleteBlogPostAction,
  deleteBlogPostCommentAction,
  getBlogPostDetailsAction,
  publishBlogPostAction,
  publishBlogPostCommentAction,
  updateBlogPostCommentAction,
} from '~/framework/modules/blog/actions';
import BlogPostDetails from '~/framework/modules/blog/components/blog-post-details';
import BlogPlaceholderDetails from '~/framework/modules/blog/components/placeholder/details';
import { blogRouteNames } from '~/framework/modules/blog/navigation';
import { Blog, BlogPostWithAudience } from '~/framework/modules/blog/reducer';
import { hasPermissionManager, publishBlogPostResourceRight } from '~/framework/modules/blog/rights';
import { blogService } from '~/framework/modules/blog/service';
import { ResourceWithCommentsTemplate } from '~/framework/modules/comments';
import { CommentsThreadProps } from '~/framework/modules/comments/components/comments-thread';
import { resourceHasRight } from '~/framework/util/resourceRights';

import styles from './styles';
import { BlogPostDetailsScreenEventProps, BlogPostDetailsScreenProps } from './types';

export const BlogPostDetailsScreenOptions = screenOptions(() => ({ title: '' }));

const BlogPostDetailsScreenLoaded = withSession<
  BlogPostDetailsScreenProps & {
    refreshControl: FlatListProps<any>['refreshControl'];
    blogData: Blog;
    postData: BlogPostWithAudience;
    refresh: () => Promise<BlogPostWithAudience>;
  }
>(function ({
  blogData,
  handleDeleteBlogPost,
  handleDeleteBlogPostComment,
  handleGetBlogPostDetails,
  handlePublishBlogPost,
  handlePublishBlogPostComment,
  handleUpdateBlogPostComment,
  navigation,
  postData,
  refresh,
  refreshControl,
  route,
  route: {
    params: { blogId, postId },
  },
  session,
}) {
  const [autoScrollItem, setAutoScrollItem] = React.useState<
    ArrayElement<React.ComponentProps<typeof ResourceWithCommentsTemplate>['data']>['id'] | undefined
  >(undefined);

  const deletePost = React.useCallback(async () => {
    try {
      await handleDeleteBlogPost({ blogId, postId });
      navigation.navigate(
        blogRouteNames.blogPostList,
        {
          blogId,
          forceReload: true,
        },
        { pop: true },
      );
    } catch {
      Alert.alert(I18n.get('blog-postdetails-error-title'), I18n.get('blog-postdetails-error-text'));
    }
  }, [blogId, handleDeleteBlogPost, navigation, postId]);

  const submitComment = React.useCallback<NonNullable<CommentsThreadProps['onSubmit']>>(
    async (comment, replyTo) => {
      try {
        handlePublishBlogPostComment({ blogId, postId }, comment.content, replyTo);
        const newData = await refresh();
        if (newData.comments.length > 0) setAutoScrollItem(newData.comments[0].id);
      } catch {
        Alert.alert(I18n.get('blog-postdetails-error-title'), I18n.get('blog-postdetails-error-text'));
      }
    },
    [handlePublishBlogPostComment, blogId, postId, refresh],
  );

  const updateComment = React.useCallback<NonNullable<CommentsThreadProps['onEdit']>>(
    async (comment, commentId) => {
      try {
        await handleUpdateBlogPostComment({ blogId, commentId, postId }, comment.content);
        await refresh();
      } catch {
        Alert.alert(I18n.get('blog-postdetails-error-title'), I18n.get('blog-postdetails-error-text'));
      }
    },
    [handleUpdateBlogPostComment, blogId, postId, refresh],
  );

  const deleteComment = React.useCallback<NonNullable<CommentsThreadProps['onDelete']>>(
    async commentId => {
      try {
        await handleDeleteBlogPostComment({ blogId, commentId, postId });
        await refresh();
      } catch {
        Alert.alert(I18n.get('blog-postdetails-error-title'), I18n.get('blog-postdetails-error-text'));
      }
    },
    [handleDeleteBlogPostComment, blogId, postId, refresh],
  );

  // Silent refresh on focus
  React.useEffect(() => navigation.addListener('focus', refresh), [refresh, navigation]);

  // Navbar actions
  React.useEffect(() => {
    const menuData =
      blogData && postData && (hasPermissionManager(blogData, session) || postData.author.userId === session.user.id)
        ? [
            {
              action: () =>
                navigation.navigate(blogRouteNames.blogEditPost, {
                  blog: blogData,
                  content: postData.content,
                  postId: postData._id,
                  postState: postData.state,
                  title: postData.title,
                }),
              icon: {
                android: 'ic_edit',
                ios: 'pencil',
              },
              title: I18n.get('common-edit'),
            },
            deleteAction({
              action: () => {
                Alert.alert(I18n.get('blog-postdetails-deletion-title'), I18n.get('blog-postdetails-deletion-text'), [
                  {
                    style: 'default',
                    text: I18n.get('common-cancel'),
                  },
                  {
                    onPress: deletePost,
                    style: 'destructive',
                    text: I18n.get('common-delete'),
                  },
                ]);
              },
            }),
          ]
        : [];

    navigation.setOptions({
      title: postData?.title,
      ...(menuData.length
        ? {
            headerRight: () =>
              menuData.length > 0 ? (
                <PopupMenu actions={menuData}>
                  <NavBarAction icon="ui-options" />
                </PopupMenu>
              ) : undefined,
          }
        : undefined),
    });
  }, [blogData, postData, deletePost, navigation, session]);

  const publishPost = React.useCallback(async () => {
    try {
      if (!blogData || !postData) return;
      await handlePublishBlogPost({ blogId: blogData.id, postId: postData._id });
      await handleGetBlogPostDetails({
        blogId: blogData.id,
        postId: postData._id,
      });
      await refresh();
      Toast.showSuccess(I18n.get('blog-postdetails-publish-success'));
    } catch {
      Toast.showError(I18n.get('blog-postdetails-error-text'));
    }
  }, [blogData, postData, handlePublishBlogPost, handleGetBlogPostDetails, refresh]);

  const renderFooter = () => {
    const hasPublishBlogPostRight = session && blogData && resourceHasRight(blogData, publishBlogPostResourceRight, session);

    return postData?.state === 'SUBMITTED' ? (
      hasPublishBlogPostRight ? (
        <BottomButtonSheet text={I18n.get('blog-postdetails-publish')} action={publishPost} />
      ) : (
        <BottomSheet
          content={
            <SmallBoldText style={styles.footerWaitingValidation}>{I18n.get('blog-postdetails-waitingvalidation')}</SmallBoldText>
          }
        />
      )
    ) : null;
  };

  const canAddComment = React.useMemo<boolean>(() => true, []);

  return (
    <ResourceWithCommentsTemplate
      navigation={navigation}
      route={route}
      canAddComment={canAddComment}
      data={postData.comments}
      onSubmit={submitComment}
      onEdit={updateComment}
      focusItem={autoScrollItem}
      onDelete={deleteComment}
      refreshControl={refreshControl}
      ListHeaderComponent={<BlogPostDetails blog={blogData} post={postData} session={session} />}
      ListFooterComponent={renderFooter}
    />
  );
});

const mapDispatchToProps: (
  dispatch: ThunkDispatch<any, any, any>,
  getState: () => IGlobalState,
) => BlogPostDetailsScreenEventProps = dispatch => ({
  dispatch,

  // TS BUG: dispatch mishandled
  handleDeleteBlogPost: async (blogPostId: { blogId: string; postId: string }) => {
    return (await dispatch(deleteBlogPostAction(blogPostId))) as unknown as number | undefined;
  },

  // TS BUG: dispatch mishandled
  handleDeleteBlogPostComment: async (blogPostCommentId: { blogId: string; postId: string; commentId: string }) => {
    return (await dispatch(deleteBlogPostCommentAction(blogPostCommentId))) as unknown as number | undefined;
  },

  handleGetBlogPostDetails: async (blogPostId: { blogId: string; postId: string }, blogPostState?: string) => {
    return (await dispatch(getBlogPostDetailsAction(blogPostId, blogPostState))) as unknown as BlogPostWithAudience | undefined;
  },

  // TS BUG: dispatch mishandled
  handlePublishBlogPost: async (blogPostId: { blogId: string; postId: string }) => {
    return dispatch(publishBlogPostAction(blogPostId.blogId, blogPostId.postId));
  },

  // TS BUG: dispatch mishandled
  handlePublishBlogPostComment: async (blogPostId: { blogId: string; postId: string }, comment: string, replyTo?: string) => {
    return (await dispatch(publishBlogPostCommentAction(blogPostId, comment, replyTo))) as unknown as number | undefined;
  },

  // TS BUG: dispatch mishandled
  handleUpdateBlogPostComment: async (
    blogPostCommentId: { blogId: string; postId: string; commentId: string },
    comment: string,
  ) => {
    return (await dispatch(updateBlogPostCommentAction(blogPostCommentId, comment))) as unknown as number | undefined;
  },
});

export const BlogPostDetailsScreen = connect(
  undefined,
  mapDispatchToProps,
)(
  withSession<BlogPostDetailsScreenProps>(function ({
    handleGetBlogPostDetails,
    navigation,
    route,
    route: {
      params: { blogId, postId },
    },
    session,
    ...props
  }) {
    const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
    const [blogData, setBlogData] = React.useState<Blog | undefined>(undefined);
    const [postData, setPostData] = React.useState<BlogPostWithAudience | undefined>(undefined);
    const audience = useAudience({ module: 'blog', resourceId: postId, resourceType: 'post' });

    const loadAudienceData = React.useCallback(async () => {
      try {
        const views = await audienceService.view.getSummary('blog', 'post', [postId]);
        const reactions = await audienceService.reaction.getSummary('blog', 'post', [postId]);
        setPostData(
          prevBlogPostData =>
            ({
              ...prevBlogPostData,
              audience: {
                reactions: {
                  total: reactions.reactionsByResource[postId].totalReactionsCounter ?? 0,
                  types: reactions.reactionsByResource[postId].reactionTypes,
                  userReaction: reactions.reactionsByResource[postId].userReaction ?? null,
                },
                views: views[postId],
              },
            }) as BlogPostWithAudience,
        );
      } catch (e) {
        console.error(e);
      }
    }, [postId]);

    const loadContent = React.useCallback(async () => {
      await dispatch(refreshSessionIdForAccountAction(session));
      setBlogData(await blogService.get(session, blogId));
      let blogPostState: string | undefined;
      const newBlogPostData = (await handleGetBlogPostDetails({ blogId, postId }, blogPostState)) as
        | BlogPostWithAudience
        | undefined;
      if (!newBlogPostData) throw new Error('blogPostData is undefined');
      setPostData(newBlogPostData);
      await loadAudienceData();
      audience.markView();
      return newBlogPostData;
    }, [audience, blogId, dispatch, loadAudienceData, handleGetBlogPostDetails, postId, session]);

    const renderContent = React.useCallback<NonNullable<ContentLoaderProps['renderContent']>>(
      refreshControl => (
        <BlogPostDetailsScreenLoaded
          navigation={navigation}
          route={route}
          refreshControl={refreshControl}
          handleGetBlogPostDetails={handleGetBlogPostDetails}
          blogData={blogData!}
          postData={postData!}
          refresh={loadContent}
          {...props}
        />
      ),
      [blogData, handleGetBlogPostDetails, loadContent, navigation, postData, props, route],
    );

    return <ContentLoader loadContent={loadContent} renderContent={renderContent} renderLoading={BlogPlaceholderDetails} />;
  }),
);

export default BlogPostDetailsScreen;
