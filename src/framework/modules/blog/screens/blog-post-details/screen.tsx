import { CommonActions, UNSTABLE_usePreventRemove, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Viewport } from '@skele/components';
import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, EmitterSubscription, FlatList, Keyboard, Platform, RefreshControl, View } from 'react-native';
import { KeyboardAvoidingFlatList } from 'react-native-keyboard-avoiding-scroll-view';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { BottomButtonSheet } from '~/framework/components/BottomButtonSheet';
import BottomEditorSheet from '~/framework/components/BottomEditorSheet';
import { BottomSheet } from '~/framework/components/BottomSheet';
import { ContentCardHeader, ContentCardIcon, ResourceView } from '~/framework/components/card';
import CommentField, { InfoCommentField } from '~/framework/components/commentField';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { deleteAction, linkAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import { Icon } from '~/framework/components/picture/Icon';
import { CaptionBoldText, HeadingSText, SmallBoldText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import {
  deleteBlogPostAction,
  deleteBlogPostCommentAction,
  getBlogPostDetailsAction,
  publishBlogPostAction,
  publishBlogPostCommentAction,
  updateBlogPostCommentAction,
} from '~/framework/modules/blog/actions';
import { commentsString } from '~/framework/modules/blog/components/BlogPostResourceCard';
import moduleConfig from '~/framework/modules/blog/module-config';
import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';
import { BlogPost, BlogPostComment } from '~/framework/modules/blog/reducer';
import {
  commentBlogPostResourceRight,
  deleteCommentBlogPostResourceRight,
  hasPermissionManager,
  publishBlogPostResourceRight,
  updateCommentBlogPostResourceRight,
} from '~/framework/modules/blog/rights';
import { blogPostGenerateResourceUriFunction, blogService, blogUriCaptureFunction } from '~/framework/modules/blog/service';
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';
import { openUrl } from '~/framework/util/linking';
import { resourceHasRight } from '~/framework/util/resourceRights';
import { Trackers } from '~/framework/util/tracker';
import { notifierShowAction } from '~/infra/notifier/actions';
import HtmlContentView from '~/ui/HtmlContentView';

import styles from './styles';
import {
  BlogPostCommentLoadingState,
  BlogPostDetailsLoadingState,
  BlogPostDetailsScreenDataProps,
  BlogPostDetailsScreenEventProps,
  BlogPostDetailsScreenProps,
  BlogPostDetailsScreenState,
} from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.blogPostDetails>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.t('timeline.blogPostDetailsScreen.title'),
  }),
});

function PreventBack(props: { infoComment: InfoCommentField }) {
  const { infoComment } = props;
  const navigation = useNavigation();
  UNSTABLE_usePreventRemove(infoComment.changed, ({ data }) => {
    Alert.alert(
      I18n.t(`common.confirmationUnsaved${infoComment.isPublication ? 'Publication' : 'Modification'}`),
      I18n.t(`common.${infoComment.type}.confirmationUnsaved${infoComment.isPublication ? 'Publication' : 'Modification'}`),
      [
        {
          text: I18n.t('common.quit'),
          style: 'destructive',
          onPress: () => navigation.dispatch(data.action),
        },
        {
          text: I18n.t('common.continue'),
          style: 'default',
        },
      ],
    );
  });
  return null;
}

export class BlogPostDetailsScreen extends React.PureComponent<BlogPostDetailsScreenProps, BlogPostDetailsScreenState> {
  flatListRef = React.createRef<FlatList | typeof KeyboardAvoidingFlatList | null>() as React.MutableRefObject<
    FlatList | typeof KeyboardAvoidingFlatList | null
  >;

  commentFieldRefs = [];

  editedCommentId?: string = undefined;

  bottomEditorSheetRef: { current: any } = React.createRef();

  event: string | null = null;

  showSubscription: EmitterSubscription | undefined;

  hideSubscription: EmitterSubscription | undefined;

  editorOffsetRef = React.createRef<number | null>() as React.MutableRefObject<number | null>;

  state: BlogPostDetailsScreenState = {
    loadingState: BlogPostDetailsLoadingState.PRISTINE,
    publishCommentLoadingState: BlogPostCommentLoadingState.PRISTINE,
    updateCommentLoadingState: BlogPostCommentLoadingState.PRISTINE,
    blogInfos: undefined,
    blogPostData: undefined,
    errorState: false,
    isCommentFieldFocused: false,
    infoComment: {
      type: '',
      isPublication: false,
      changed: false,
      value: '',
    },
  };

  listHeight = 0;

  async doInit() {
    try {
      this.setState({ loadingState: BlogPostDetailsLoadingState.INIT });
      await this.doGetBlogPostDetails();
      await this.doGetBlogInfos();
    } finally {
      this.setState({ loadingState: BlogPostDetailsLoadingState.DONE });
    }
  }

  async doRefresh() {
    try {
      this.setState({ loadingState: BlogPostDetailsLoadingState.REFRESH });
      await this.doGetBlogPostDetails();
    } finally {
      this.setState({ loadingState: BlogPostDetailsLoadingState.DONE });
    }
  }

  async doCreateComment(comment: string, commentId?: string) {
    try {
      if (commentId) {
        this.setState({ updateCommentLoadingState: BlogPostCommentLoadingState.PUBLISH });
      } else {
        this.setState({ publishCommentLoadingState: BlogPostCommentLoadingState.PUBLISH });
      }
      await this.doCreateBlogPostComment(comment, commentId);
      await this.doGetBlogPostDetails();
      // Note #1: setTimeout is used to wait for the FlatList height to update (after a comment is added).
      // Note #2: scrollToEnd seems to become less precise once there is lots of data.
      if (!commentId) {
        this.bottomEditorSheetRef?.current?.clearCommentField();
        setTimeout(() => {
          (this.flatListRef.current as FlatList)?.scrollToOffset({
            offset: this.listHeight,
          });
        }, 50);
      } else this.commentFieldRefs[commentId]?.setIsEditingFalse();
    } finally {
      if (commentId) {
        this.setState({ updateCommentLoadingState: BlogPostCommentLoadingState.DONE });
      } else {
        this.setState({ publishCommentLoadingState: BlogPostCommentLoadingState.DONE });
      }
    }
  }

  async doDeleteComment(commentId: string) {
    await this.doDeleteBlogPostComment(commentId);
    await this.doGetBlogPostDetails();
  }

  async doGetBlogPostDetails() {
    try {
      const { route, handleGetBlogPostDetails } = this.props;
      const notification = route.params.notification;
      const useNotification = route.params.useNotification ?? true;
      const ids = this.getBlogPostIds();
      let blogPostState: string | undefined;
      if (notification && useNotification && notification['event-type'] === 'SUBMIT-POST') {
        blogPostState = undefined; // Will be got by an additional request to api
      } else blogPostState = route.params.blogPost?.state;
      const blogPostData = await handleGetBlogPostDetails(ids, blogPostState);
      this.setState({ blogPostData });
    } catch {
      // ToDo: Error handling
      this.setState({ errorState: true });
    }
  }

  async doCreateBlogPostComment(comment: string, commentId?: string) {
    try {
      const { handlePublishBlogPostComment, handleUpdateBlogPostComment } = this.props;
      const ids = this.getBlogPostIds();
      if (commentId) {
        ids.commentId = commentId;
        await handleUpdateBlogPostComment(ids, comment);
      } else await handlePublishBlogPostComment(ids, comment);
    } catch {
      // ToDo: Error handling
      Alert.alert(I18n.t('common.error.title'), I18n.t('common.error.text'));
    }
  }

  async doDeleteBlogPostComment(commentId: string) {
    try {
      const { handleDeleteBlogPostComment } = this.props;
      if (!commentId) {
        throw new Error('failed to call api (commentId is undefined)');
      }
      const ids = this.getBlogPostIds();
      ids.commentId = commentId;
      await handleDeleteBlogPostComment(ids);
    } catch {
      // ToDo: Error handling
      Alert.alert(I18n.t('common.error.title'), I18n.t('common.error.text'));
    }
  }

  async doDeleteBlogPost(postId: string) {
    try {
      const { handleDeleteBlogPost } = this.props;
      if (!postId) {
        throw new Error('failed to call api (commentId is undefined)');
      }
      const ids = this.getBlogPostIds();
      ids.postID = postId;

      await handleDeleteBlogPost(ids);
    } catch {
      Alert.alert(I18n.t('common.error.title'), I18n.t('common.error.text'));
    }
  }

  async doGetBlogInfos() {
    try {
      const { session } = this.props;
      if (!session) throw new Error('BlogPostDetailsScreen.doGetBlogInfos: no session');
      const ids = this.getBlogPostIds();
      const blogId = ids?.blogId;
      const blogInfos = await blogService.get(session, blogId);
      this.setState({ blogInfos });
    } catch {
      // ToDo: Error handling
    }
  }

  getBlogPostIds() {
    const { route } = this.props;
    const notification = route.params.notification;
    const useNotification = route.params.useNotification ?? true;
    let ids;
    if (notification && useNotification) {
      const resourceUri = notification?.resource.uri;
      if (!resourceUri) {
        throw new Error('failed to call api (resourceUri is undefined)');
      }
      ids = blogUriCaptureFunction(resourceUri) as Required<ReturnType<typeof blogUriCaptureFunction>>;
      if (!ids.blogId || !ids.postId) {
        throw new Error(`failed to capture resourceUri "${resourceUri}": ${ids}`);
      }
    } else {
      const blogId = route.params.blog?.id;
      const postId = route.params.blogPost?._id;
      if (!blogId || !postId) {
        throw new Error(`missing blogId or postId : ${{ blogId, postId }}`);
      }
      ids = { blogId, postId };
    }
    return ids;
  }

  setActionNavbar = () => {
    const { route, navigation, session } = this.props;
    const { blogPostData, blogInfos, errorState, loadingState } = this.state;
    const notification = (route.params.useNotification ?? true) && route.params.notification;
    const blogId = route.params.blog?.id;
    let resourceUri = notification && notification?.resource.uri;
    if (!resourceUri && blogPostData && blogId) {
      resourceUri = blogPostGenerateResourceUriFunction({ blogId, postId: blogPostData._id });
    }

    const menuItemOpenBrowser = linkAction({
      title: I18n.t('common.openInBrowser'),
      action: () => {
        if (!session) return;
        const url = `${session.platform!.url}${resourceUri}`;
        openUrl(url);
        Trackers.trackEvent('Blog', 'GO TO', 'View in Browser');
      },
    });

    const menuData =
      session && (hasPermissionManager(blogInfos!, session) || blogPostData?.author.userId === session.user.id)
        ? [
            menuItemOpenBrowser,
            deleteAction({
              action: () => {
                Alert.alert(I18n.t('common.deletionPostBlogTitle'), I18n.t('common.deletionPostBlogText'), [
                  {
                    text: I18n.t('common.cancel'),
                    style: 'default',
                  },
                  {
                    text: I18n.t('common.delete'),
                    style: 'destructive',
                    onPress: () => {
                      this.doDeleteBlogPost(blogPostData!._id).then(() => {
                        navigation.dispatch(CommonActions.goBack());
                      });
                    },
                  },
                ]);
              },
            }),
          ]
        : [menuItemOpenBrowser];

    this.props.navigation.setOptions({
      headerTitle: navBarTitle(blogPostData?.title ?? I18n.t('timeline.blogPostDetailsScreen.title')),
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () =>
        resourceUri &&
        (loadingState === BlogPostDetailsLoadingState.DONE || loadingState === BlogPostDetailsLoadingState.REFRESH) &&
        !errorState ? (
          <PopupMenu actions={menuData}>
            <NavBarAction icon="ui-options" />
          </PopupMenu>
        ) : undefined,
    });
  };

  componentDidMount() {
    const { route } = this.props;
    const blogPost = route.params.blogPost;
    const blog = route.params.blog;
    const { blogPostData } = this.state;
    const notification = (route.params.useNotification ?? true) && route.params.notification;

    if (blog && blogPost) {
      this.setState({
        blogInfos: blog,
        blogPostData: blogPost,
        loadingState: BlogPostDetailsLoadingState.DONE,
      });
    } else this.doInit();

    this.showSubscription = Keyboard.addListener(
      Platform.select({ ios: 'keyboardDidShow', android: 'keyboardDidShow' })!,
      event => {
        if (this.editedCommentId && this.commentFieldRefs[this.editedCommentId]?.isCommentFieldFocused())
          this.setState({ isCommentFieldFocused: true });
        setTimeout(() => {
          if (!this.editedCommentId) return;
          const commentIndex = blogPostData?.comments?.findIndex(c => c.id === this.editedCommentId);
          if (commentIndex !== undefined && commentIndex > -1) {
            if (Platform.OS === 'ios') {
              (this.flatListRef.current as FlatList)?.scrollToIndex({
                index: commentIndex,
                viewPosition: 1,
              });
            } else {
              (this.flatListRef.current as FlatList)?.scrollToIndex({
                index: commentIndex,
                viewPosition: 0,
                viewOffset:
                  UI_SIZES.screen.height -
                  UI_SIZES.elements.navbarHeight -
                  event.endCoordinates.height -
                  (this.editorOffsetRef.current ?? 0),
              });
            }
          }
        }, 50);
      },
    );

    this.hideSubscription = Keyboard.addListener(Platform.select({ ios: 'keyboardWillHide', android: 'keyboardDidHide' })!, () => {
      if (this.editedCommentId && !this.commentFieldRefs[this.editedCommentId]?.isCommentFieldFocused())
        this.setState({ isCommentFieldFocused: false });
    });

    // Update notification event if any
    this.event = notification ? notification['event-type'] : null;
  }

  componentDidUpdate() {
    this.setActionNavbar();
  }

  componentWillUnmount() {
    this.showSubscription?.remove();
    this.hideSubscription?.remove();
  }

  renderError() {
    return <EmptyContentScreen />;
  }

  renderContent() {
    const { session } = this.props;
    const { loadingState, publishCommentLoadingState, blogPostData, blogInfos } = this.state;
    const blogPostComments = blogPostData?.comments;
    const isPublishingComment = publishCommentLoadingState === BlogPostCommentLoadingState.PUBLISH;
    const hasCommentBlogPostRight = session && blogInfos && resourceHasRight(blogInfos, commentBlogPostResourceRight, session);
    const hasPublishBlogPostRight = session && blogInfos && resourceHasRight(blogInfos, publishBlogPostResourceRight, session);
    const ListComponent = Platform.select<React.ComponentType<any>>({
      ios: FlatList,
      android: KeyboardAvoidingFlatList,
    })!;
    const footer = this.renderFooter(isPublishingComment, hasCommentBlogPostRight ?? false, hasPublishBlogPostRight ?? false);

    return (
      <>
        <Viewport.Tracker>
          <ListComponent
            ref={ref => {
              this.flatListRef.current = ref;
            }}
            initialNumToRender={blogPostComments?.length}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
            data={blogPostComments}
            keyExtractor={(item: BlogPostComment) => item.id.toString()}
            ListHeaderComponent={this.renderBlogPostDetails()}
            removeClippedSubviews={false}
            refreshControl={
              <RefreshControl
                refreshing={[BlogPostDetailsLoadingState.REFRESH, BlogPostDetailsLoadingState.INIT].includes(loadingState)}
                onRefresh={() => this.doRefresh()}
              />
            }
            renderItem={({ item, index }) => this.renderComment(item, index)}
            scrollIndicatorInsets={{ right: 0.001 }} // 🍎 Hack to guarantee scrollbar to be stick on the right edge of the screen.
            style={styles.contentStyle2}
            onContentSizeChange={(width, height) => {
              this.listHeight = height;
            }}
            onLayout={() => {
              // Scroll to last comment if coming from blog spot comment notification
              if (this.flatListRef.current && this.event === 'PUBLISH-COMMENT')
                setTimeout(() => {
                  (this.flatListRef.current as FlatList)?.scrollToEnd();
                  this.event = null;
                }, 50);
            }}
            {...Platform.select({ ios: {}, android: { stickyFooter: footer } })}
          />
        </Viewport.Tracker>
        {Platform.select({ ios: footer, android: null })}
      </>
    );
  }

  renderFooter(isPublishingComment: boolean, hasCommentBlogPostRight: boolean, hasPublishBlogPostRight: boolean) {
    const { blogPostData, blogInfos, isCommentFieldFocused } = this.state;
    return blogPostData?.state === 'PUBLISHED' ? (
      hasCommentBlogPostRight && !isCommentFieldFocused ? (
        <BottomEditorSheet
          ref={this.bottomEditorSheetRef}
          onPublishComment={(comment, commentId) => this.doCreateComment(comment, commentId)}
          isPublishingComment={isPublishingComment}
          onChangeText={data => this.setState({ infoComment: data })}
        />
      ) : (
        <View style={styles.footerNoComment} />
      )
    ) : blogPostData?.state === 'SUBMITTED' ? (
      hasPublishBlogPostRight ? (
        <BottomButtonSheet
          text={I18n.t('blog.post.publishAction')}
          action={async () => {
            try {
              await this.props.handlePublishBlogPost({ blogId: blogInfos!.id, postId: blogPostData._id });
              const newBlogPostData = await this.props.handleGetBlogPostDetails({
                blogId: blogInfos!.id,
                postId: blogPostData._id,
              });
              if (newBlogPostData) {
                this.setState({ blogPostData: newBlogPostData });
                this.props.navigation.setParams({
                  blogPost: newBlogPostData,
                });
              }
            } catch {
              this.props.dispatch(
                notifierShowAction({
                  type: 'error',
                  id: `${moduleConfig.routeName}/details`,
                  text: I18n.t('common.error.text'),
                }),
              );
            }
          }}
        />
      ) : (
        <BottomSheet
          content={<SmallBoldText style={styles.footerWaitingValidation}>{I18n.t('blog.post.waitingValidation')}</SmallBoldText>}
        />
      )
    ) : null;
  }

  renderBlogPostDetails() {
    const { blogInfos, blogPostData } = this.state;
    const blogPostContent = blogPostData?.content;
    const blogPostComments = blogPostData?.comments;
    const ViewportAwareTitle = Viewport.Aware(View);
    return (
      <View style={styles.detailsMain}>
        <View style={styles.detailsPost}>
          <ResourceView
            header={
              <ContentCardHeader
                icon={<ContentCardIcon userIds={[blogPostData?.author.userId || require('ASSETS/images/system-avatar.png')]} />}
                text={
                  blogPostData?.author.username ? (
                    <SmallBoldText numberOfLines={1}>{`${I18n.t('common.by')} ${blogPostData?.author.username}`}</SmallBoldText>
                  ) : undefined
                }
                date={blogPostData?.modified}
              />
            }>
            {blogPostData?.state === 'SUBMITTED' ? (
              <SmallBoldText style={styles.detailsNeedValidation}>{I18n.t('blog.post.needValidation')}</SmallBoldText>
            ) : null}
            <SmallBoldText style={styles.detailsTitleBlog}>{blogInfos?.title}</SmallBoldText>
            <HeadingSText>{blogPostData?.title}</HeadingSText>
            <HtmlContentView
              html={blogPostContent}
              onHtmlError={() => this.setState({ errorState: true })}
              onDownload={() => Trackers.trackEvent('Blog', 'DOWNLOAD ATTACHMENT', 'Read mode')}
              onError={() => Trackers.trackEvent('Blog', 'DOWNLOAD ATTACHMENT ERROR', 'Read mode')}
              onDownloadAll={() => Trackers.trackEvent('Blog', 'DOWNLOAD ALL ATTACHMENTS', 'Read mode')}
              onOpen={() => Trackers.trackEvent('Blog', 'OPEN ATTACHMENT', 'Read mode')}
            />
          </ResourceView>
        </View>
        {blogPostData?.state === 'PUBLISHED' ? (
          <View style={styles.detailsNbComments}>
            <Icon style={styles.detailsIconComments} size={18} name="chat3" color={theme.ui.text.regular} />
            <CaptionBoldText style={styles.detailsTextNbComments}>{commentsString(blogPostComments?.length || 0)}</CaptionBoldText>
          </View>
        ) : null}
      </View>
    );
  }

  renderComment(blogPostComment: BlogPostComment, index: number) {
    const { session } = this.props;
    const { blogInfos, blogPostData, updateCommentLoadingState } = this.state;

    const isUpdatingComment = updateCommentLoadingState === BlogPostCommentLoadingState.PUBLISH;
    const hasUpdateCommentBlogPostRight =
      session && blogInfos && resourceHasRight(blogInfos, updateCommentBlogPostResourceRight, session);
    const hasDeleteCommentBlogPostRight =
      session && blogInfos && resourceHasRight(blogInfos, deleteCommentBlogPostResourceRight, session);
    return (
      <CommentField
        ref={element => (this.commentFieldRefs[blogPostComment.id] = element)}
        index={index}
        isPublishingComment={isUpdatingComment}
        onPublishComment={
          hasUpdateCommentBlogPostRight ? (comment, commentId) => this.doCreateComment(comment, commentId) : undefined
        }
        onDeleteComment={
          hasDeleteCommentBlogPostRight || (session && hasPermissionManager(blogInfos!, session))
            ? () => {
                Alert.alert(I18n.t('common.deletion'), I18n.t('common.comment.confirmationDelete'), [
                  {
                    text: I18n.t('common.cancel'),
                    style: 'default',
                  },
                  {
                    text: I18n.t('common.delete'),
                    style: 'destructive',
                    onPress: () => this.doDeleteComment(blogPostComment.id),
                  },
                ]);
              }
            : undefined
        }
        onChangeText={data => this.setState({ infoComment: data })}
        editCommentCallback={() => {
          const blogPostComments = blogPostData?.comments;
          const otherBlogPostComments = blogPostComments?.filter(comment => comment.id !== blogPostComment.id);
          this.editedCommentId = blogPostComment.id;
          otherBlogPostComments?.forEach(otherBlogPostComment => {
            this.commentFieldRefs[otherBlogPostComment.id]?.setIsEditingFalse();
          });
        }}
        comment={blogPostComment.comment}
        commentId={blogPostComment.id}
        commentAuthorId={blogPostComment.author.userId}
        commentAuthor={blogPostComment.author.username}
        commentDate={blogPostComment.created}
        onEditableLayoutHeight={val => {
          this.editorOffsetRef.current = val;
        }}
        isManager={session && hasPermissionManager(blogInfos!, session)}
      />
    );
  }

  render() {
    const { route, session } = this.props;
    const { loadingState, errorState, blogPostData, blogInfos } = this.state;

    const blogId = blogInfos?.id;
    const hasCommentBlogPostRight = session && blogInfos && resourceHasRight(blogInfos, commentBlogPostResourceRight, session);
    const isBottomSheetVisible =
      (blogPostData?.state === 'PUBLISHED' && hasCommentBlogPostRight) || blogPostData?.state === 'SUBMITTED';
    const notification = (route.params.useNotification ?? true) && route.params.notification;
    let resourceUri = notification && notification?.resource.uri;
    if (!resourceUri && blogPostData && blogId) {
      resourceUri = blogPostGenerateResourceUriFunction({ blogId, postId: blogPostData._id });
    }

    const PageComponent = Platform.select<typeof KeyboardPageView | typeof PageView>({ ios: KeyboardPageView, android: PageView })!;

    return (
      <>
        <PreventBack infoComment={this.state.infoComment} />
        <PageComponent {...Platform.select({ ios: { safeArea: !isBottomSheetVisible }, android: {} })}>
          {[BlogPostDetailsLoadingState.PRISTINE, BlogPostDetailsLoadingState.INIT].includes(loadingState) ? (
            <LoadingIndicator />
          ) : errorState ? (
            this.renderError()
          ) : (
            this.renderContent()
          )}
        </PageComponent>
      </>
    );
  }
}

const mapStateToProps: (s: IGlobalState) => BlogPostDetailsScreenDataProps = s => ({
  session: getSession(),
});

const mapDispatchToProps: (
  dispatch: ThunkDispatch<any, any, any>,
  getState: () => IGlobalState,
) => BlogPostDetailsScreenEventProps = (dispatch, getState) => ({
  handleGetBlogPostDetails: async (blogPostId: { blogId: string; postId: string }, blogPostState?: string) => {
    return (await dispatch(getBlogPostDetailsAction(blogPostId, blogPostState))) as unknown as BlogPost | undefined;
  }, // TS BUG: dispatch mishandled
  handlePublishBlogPostComment: async (blogPostId: { blogId: string; postId: string }, comment: string) => {
    return (await dispatch(publishBlogPostCommentAction(blogPostId, comment))) as unknown as number | undefined;
  }, // TS BUG: dispatch mishandled
  handleUpdateBlogPostComment: async (
    blogPostCommentId: { blogId: string; postId: string; commentId: string },
    comment: string,
  ) => {
    return (await dispatch(updateBlogPostCommentAction(blogPostCommentId, comment))) as unknown as number | undefined;
  }, // TS BUG: dispatch mishandled
  handleDeleteBlogPostComment: async (blogPostCommentId: { blogId: string; postId: string; commentId: string }) => {
    return (await dispatch(deleteBlogPostCommentAction(blogPostCommentId))) as unknown as number | undefined;
  }, // TS BUG: dispatch mishandled
  handleDeleteBlogPost: async (blogPostId: { blogId: string; postId: string }) => {
    return (await dispatch(deleteBlogPostAction(blogPostId))) as unknown as number | undefined;
  }, // TS BUG: dispatch mishandled
  handlePublishBlogPost: async (blogPostId: { blogId: string; postId: string }) => {
    return dispatch(publishBlogPostAction(blogPostId.blogId, blogPostId.postId));
  },
  dispatch,
});

const BlogPostDetailsScreenConnected = connect(mapStateToProps, mapDispatchToProps)(BlogPostDetailsScreen);
export default BlogPostDetailsScreenConnected;
