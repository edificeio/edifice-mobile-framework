import { Viewport } from '@skele/components';
import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, EmitterSubscription, FlatList, Keyboard, Platform, RefreshControl, View } from 'react-native';
import { KeyboardAvoidingFlatList } from 'react-native-keyboard-avoiding-scroll-view';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { BottomButtonSheet } from '~/framework/components/BottomButtonSheet';
import BottomEditorSheet from '~/framework/components/BottomEditorSheet';
import { BottomSheet } from '~/framework/components/BottomSheet';
import { ContentCardHeader, ContentCardIcon, ResourceView } from '~/framework/components/card';
import CommentField from '~/framework/components/commentField';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { HeaderIcon, HeaderTitleAndSubtitle } from '~/framework/components/header';
import { LoadingIndicator } from '~/framework/components/loading';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import { Icon } from '~/framework/components/picture/Icon';
import PopupMenu from '~/framework/components/popup-menu';
import { deleteAction, linkAction } from '~/framework/components/popup-menu/actions';
import { CaptionBoldText, HeadingSText, SmallBoldText } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { openUrl } from '~/framework/util/linking';
import { resourceHasRight } from '~/framework/util/resourceRights';
import { getUserSession } from '~/framework/util/session';
import { Trackers } from '~/framework/util/tracker';
import { notifierShowAction } from '~/infra/notifier/actions';
import {
  deleteBlogPostAction,
  deleteBlogPostCommentAction,
  getBlogPostDetailsAction,
  publishBlogPostAction,
  publishBlogPostCommentAction,
  updateBlogPostCommentAction,
} from '~/modules/blog/actions';
import { commentsString } from '~/modules/blog/components/BlogPostResourceCard';
import moduleConfig from '~/modules/blog/moduleConfig';
import { IBlogPost, IBlogPostComment } from '~/modules/blog/reducer';
import {
  commentBlogPostResourceRight,
  deleteCommentBlogPostResourceRight,
  hasPermissionManager,
  publishBlogPostResourceRight,
  updateCommentBlogPostResourceRight,
} from '~/modules/blog/rights';
import { blogPostGenerateResourceUriFunction, blogService, blogUriCaptureFunction } from '~/modules/blog/service';
import { HtmlContentView } from '~/ui/HtmlContentView';

import styles from './styles';
import {
  BlogPostCommentLoadingState,
  BlogPostDetailsLoadingState,
  IBlogPostDetailsScreenDataProps,
  IBlogPostDetailsScreenEventProps,
  IBlogPostDetailsScreenProps,
  IBlogPostDetailsScreenState,
} from './types';

export class BlogPostDetailsScreen extends React.PureComponent<IBlogPostDetailsScreenProps, IBlogPostDetailsScreenState> {
  _titleRef?: React.Ref<any> = undefined;

  flatListRef = React.createRef<FlatList | KeyboardAvoidingFlatList>();

  commentFieldRefs = [];

  editedCommentId?: string = undefined;

  bottomEditorSheetRef: { current: any } = React.createRef();

  event: string | null = null;

  showSubscription: EmitterSubscription | undefined;

  hideSubscription: EmitterSubscription | undefined;

  editorOffsetRef = React.createRef<number>(0);

  state: IBlogPostDetailsScreenState = {
    loadingState: BlogPostDetailsLoadingState.PRISTINE,
    publishCommentLoadingState: BlogPostCommentLoadingState.PRISTINE,
    updateCommentLoadingState: BlogPostCommentLoadingState.PRISTINE,
    blogInfos: undefined,
    blogPostData: undefined,
    errorState: false,
    showHeaderTitle: false,
    isCommentFieldFocused: false,
  };

  // RENDER =======================================================================================

  render() {
    const { navigation, session } = this.props;
    const { loadingState, errorState, blogPostData, blogInfos } = this.state;

    const blogId = blogInfos?.id;
    const hasCommentBlogPostRight = blogInfos && resourceHasRight(blogInfos, commentBlogPostResourceRight, session);
    const isBottomSheetVisible =
      (blogPostData?.state === 'PUBLISHED' && hasCommentBlogPostRight) || blogPostData?.state === 'SUBMITTED';
    const notification = navigation.getParam('useNotification', true) && navigation.getParam('notification');
    let resourceUri = notification && notification?.resource.uri;
    if (!resourceUri && blogPostData && blogId) {
      resourceUri = blogPostGenerateResourceUriFunction({ blogId, postId: blogPostData._id });
    }

    const menuItemOpenBrowser = {
      text: I18n.t('common.openInBrowser'),
      icon: { type: 'NamedSvg', name: 'ui-externalLink' },
      onPress: () => {
        //TODO: create generic function inside oauth (use in myapps, etc.)
        if (!DEPRECATED_getCurrentPlatform()) {
          return null;
        }
        const url = `${DEPRECATED_getCurrentPlatform()!.url}${resourceUri}`;
        openUrl(url);
        Trackers.trackEvent('Blog', 'GO TO', 'View in Browser');
      },
    };
    const menuData =
      hasPermissionManager(blogInfos!, session) || blogPostData?.author.userId === session.user.id
        ? [
            menuItemOpenBrowser,
            {
              text: I18n.t('common.deletionPostBlogMenu'),
              icon: { type: 'NamedSvg', name: 'ui-delete' },
              color: theme.palette.status.failure.regular,
              onPress: () => {
                Alert.alert(I18n.t('common.deletionPostBlogTitle'), I18n.t('common.deletionPostBlogText'), [
                  {
                    text: I18n.t('common.cancel'),
                    style: 'default',
                  },
                  {
                    text: I18n.t('common.delete'),
                    style: 'destructive',
                    onPress: () => {
                      //TODO: supprimer le billet
                      console.log(blogPostData!._id, 'postID', blogId, 'blogID');
                      this.doDeleteBlogPost(blogPostData!._id).then(() => {
                        navigation.dispatch(NavigationActions.back());
                      });
                    },
                  },
                ]);
              },
            },
          ]
        : [menuItemOpenBrowser];

    const PageComponent = Platform.select({ ios: KeyboardPageView, android: PageView })!;

    return (
      <>
        <PageComponent
          {...Platform.select({ ios: { safeArea: !isBottomSheetVisible }, android: {} })}
          navigation={navigation}
          navBarWithBack={this.navBarInfo()}
          onBack={() => {
            this.bottomEditorSheetRef?.current?.doesCommentExist()
              ? this.bottomEditorSheetRef?.current?.confirmDiscard(() => navigation.dispatch(NavigationActions.back()))
              : this.editedCommentId &&
                this.commentFieldRefs[this.editedCommentId]?.doesCommentExist() &&
                !this.commentFieldRefs[this.editedCommentId]?.isCommentUnchanged()
              ? this.commentFieldRefs[this.editedCommentId]?.confirmDiscard(() => navigation.dispatch(NavigationActions.back()))
              : navigation.dispatch(NavigationActions.back());
          }}>
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

  navBarInfo() {
    const { navigation } = this.props;
    const { blogPostData, errorState, loadingState } = this.state;
    const notification = navigation.getParam('useNotification', true) && navigation.getParam('notification');
    const blogId = navigation.getParam('blog')?.id;
    let resourceUri = notification && notification?.resource.uri;
    if (!resourceUri && blogPostData && blogId) {
      resourceUri = blogPostGenerateResourceUriFunction({ blogId, postId: blogPostData._id });
    }
    return {
      title:
        blogPostData?.title && this.state.showHeaderTitle ? (
          <HeaderTitleAndSubtitle title={blogPostData?.title} subtitle={I18n.t('timeline.blogPostDetailsScreen.title')} />
        ) : (
          I18n.t('timeline.blogPostDetailsScreen.title')
        ),
      right:
        resourceUri &&
        (loadingState === BlogPostDetailsLoadingState.DONE || loadingState === BlogPostDetailsLoadingState.REFRESH) &&
        !errorState ? (
          <PopupMenu
            actions={[
              linkAction({
                title: I18n.t('common.openInBrowser'),
                action: () => {
                  //TODO: create generic function inside oauth (use in myapps, etc.)
                  if (!DEPRECATED_getCurrentPlatform()) {
                    return null;
                  }
                  const url = `${DEPRECATED_getCurrentPlatform()!.url}${resourceUri}`;
                  openUrl(url);
                  Trackers.trackEvent('Blog', 'GO TO', 'View in Browser');
                },
              }),
              deleteAction({
                action: () => {
                  Alert.alert(I18n.t('common.deletion'), I18n.t('common.deletionPostBlog'), [
                    {
                      text: I18n.t('common.cancel'),
                      style: 'default',
                    },
                    {
                      text: I18n.t('common.delete'),
                      style: 'destructive',
                      onPress: () => {
                        this.doDeleteBlogPost(blogPostData!._id).then(() => {
                          navigation.dispatch(NavigationActions.back());
                        });
                      },
                    },
                  ]);
                },
              }),
            ]}>
            <HeaderIcon name="more_vert" iconSize={24} />
          </PopupMenu>
        ) : undefined,
    };
  }

  renderError() {
    return <EmptyContentScreen />;
  }

  listHeight = 0;

  renderContent() {
    const { session } = this.props;
    const { loadingState, publishCommentLoadingState, blogPostData, blogInfos } = this.state;
    const blogPostComments = blogPostData?.comments;
    const isPublishingComment = publishCommentLoadingState === BlogPostCommentLoadingState.PUBLISH;
    const hasCommentBlogPostRight = blogInfos && resourceHasRight(blogInfos, commentBlogPostResourceRight, session);
    const hasPublishBlogPostRight = blogInfos && resourceHasRight(blogInfos, publishBlogPostResourceRight, session);
    const ListComponent = Platform.select<typeof FlatList | typeof KeyboardAvoidingFlatList>({
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
            keyExtractor={(item: IBlogPostComment) => item.id.toString()}
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
                  this.flatListRef.current?.scrollToEnd();
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
              await this.props.handlePublishBlogPost({ blogId: blogInfos.id, postId: blogPostData._id });
              const newBlogPostData = await this.props.handleGetBlogPostDetails({
                blogId: blogInfos.id,
                postId: blogPostData._id,
              });
              newBlogPostData && this.setState({ blogPostData: newBlogPostData });
              newBlogPostData &&
                this.props.navigation.setParams({
                  blogPost: newBlogPostData,
                });
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
            <ViewportAwareTitle
              style={styles.detailsTitlePost}
              onViewportEnter={() => this.updateVisible(true)}
              onViewportLeave={() => this.updateVisible(false)}
              innerRef={ref => (this._titleRef = ref)}>
              <HeadingSText>{blogPostData?.title}</HeadingSText>
            </ViewportAwareTitle>
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

  renderComment(blogPostComment: IBlogPostComment, index: number) {
    const { navigation, session } = this.props;
    const { blogInfos, blogPostData, updateCommentLoadingState } = this.state;

    const blog = navigation.getParam('blog');
    const isUpdatingComment = updateCommentLoadingState === BlogPostCommentLoadingState.PUBLISH;
    const hasUpdateCommentBlogPostRight = blogInfos && resourceHasRight(blogInfos, updateCommentBlogPostResourceRight, session);
    const hasDeleteCommentBlogPostRight = blogInfos && resourceHasRight(blogInfos, deleteCommentBlogPostResourceRight, session);
    return (
      <CommentField
        ref={element => (this.commentFieldRefs[blogPostComment.id] = element)}
        index={index}
        isPublishingComment={isUpdatingComment}
        onPublishComment={
          hasUpdateCommentBlogPostRight ? (comment, commentId) => this.doCreateComment(comment, commentId) : undefined
        }
        onDeleteComment={
          hasDeleteCommentBlogPostRight || hasPermissionManager(blogInfos!, session)
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
        isManager={hasPermissionManager(blogInfos!, session)}
      />
    );
  }

  // LIFECYCLE ====================================================================================

  componentDidMount() {
    const { navigation } = this.props;
    const blogPost = navigation.getParam('blogPost');
    const blog = navigation.getParam('blog');

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
        const { blogPostData } = this.state;
        if (this.editedCommentId && this.commentFieldRefs[this.editedCommentId]?.isCommentFieldFocused())
          this.setState({ isCommentFieldFocused: true });
        setTimeout(() => {
          if (!this.editedCommentId) return;
          const commentIndex = blogPostData?.comments?.findIndex(c => c.id === this.editedCommentId);
          if (commentIndex !== undefined && commentIndex > -1) {
            if (Platform.OS === 'ios') {
              this.flatListRef.current?.scrollToIndex({
                index: commentIndex,
                viewPosition: 1,
              });
            } else {
              this.flatListRef.current?.scrollToIndex({
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
    const notification = this.props.navigation?.state?.params?.notification;
    this.event = notification ? notification['event-type'] : null;
  }

  componentWillUnmount() {
    this.showSubscription?.remove();
    this.hideSubscription?.remove();
  }

  private updateVisible(isVisible: boolean) {
    const { showHeaderTitle } = this.state;
    if (showHeaderTitle && isVisible) this.setState({ showHeaderTitle: false });
    else if (!showHeaderTitle && !isVisible) this.setState({ showHeaderTitle: true });
  }

  // METHODS ======================================================================================

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
      commentId
        ? this.setState({ updateCommentLoadingState: BlogPostCommentLoadingState.PUBLISH })
        : this.setState({ publishCommentLoadingState: BlogPostCommentLoadingState.PUBLISH });
      await this.doCreateBlogPostComment(comment, commentId);
      await this.doGetBlogPostDetails();
      // Note #1: setTimeout is used to wait for the FlatList height to update (after a comment is added).
      // Note #2: scrollToEnd seems to become less precise once there is lots of data.
      if (!commentId) {
        this.bottomEditorSheetRef?.current?.clearCommentField();
        setTimeout(() => {
          this.flatListRef.current?.scrollToOffset({
            offset: this.listHeight,
          });
        }, 50);
      } else this.commentFieldRefs[commentId]?.setIsEditingFalse();
    } finally {
      commentId
        ? this.setState({ updateCommentLoadingState: BlogPostCommentLoadingState.DONE })
        : this.setState({ publishCommentLoadingState: BlogPostCommentLoadingState.DONE });
    }
  }

  async doDeleteComment(commentId: string) {
    await this.doDeleteBlogPostComment(commentId);
    await this.doGetBlogPostDetails();
  }

  async doGetBlogPostDetails() {
    try {
      const { navigation, handleGetBlogPostDetails } = this.props;
      const notification = navigation.getParam('notification');
      const useNotification = navigation.getParam('useNotification', true);
      const ids = this.getBlogPostIds();
      let blogPostState: string | undefined = undefined;
      if (notification && useNotification && notification['event-type'] === 'SUBMIT-POST') {
        blogPostState = undefined; // Will be got by an additional request to api
      } else blogPostState = navigation.getParam('blogPost')?.state;
      const blogPostData = await handleGetBlogPostDetails(ids, blogPostState);
      this.setState({ blogPostData });
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
      Alert.alert(I18n.t('common.error.title'), I18n.t('common.error.text'));
    }
  }

  async doGetBlogInfos() {
    try {
      const { session } = this.props;
      const ids = this.getBlogPostIds();
      const blogId = ids?.blogId;
      const blogInfos = await blogService.get(session, blogId);
      this.setState({ blogInfos });
    } catch (e) {
      // ToDo: Error handling
    }
  }

  getBlogPostIds() {
    const { navigation } = this.props;
    const notification = navigation.getParam('notification');
    const useNotification = navigation.getParam('useNotification', true);
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
      const blogId = navigation.getParam('blog')?.id;
      const postId = navigation.getParam('blogPost')?._id;
      if (!blogId || !postId) {
        throw new Error(`missing blogId or postId : ${{ blogId, postId }}`);
      }
      ids = { blogId, postId };
    }
    return ids;
  }
}

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => IBlogPostDetailsScreenDataProps = s => ({
  session: getUserSession(),
});

const mapDispatchToProps: (
  dispatch: ThunkDispatch<any, any, any>,
  getState: () => IGlobalState,
) => IBlogPostDetailsScreenEventProps = (dispatch, getState) => ({
  handleGetBlogPostDetails: async (blogPostId: { blogId: string; postId: string }, blogPostState?: string) => {
    return (await dispatch(getBlogPostDetailsAction(blogPostId, blogPostState))) as unknown as IBlogPost | undefined;
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
    return await dispatch(publishBlogPostAction(blogPostId.blogId, blogPostId.postId));
  },
  dispatch,
});

const BlogPostDetailsScreenConnected = connect(mapStateToProps, mapDispatchToProps)(BlogPostDetailsScreen);
export default BlogPostDetailsScreenConnected;
