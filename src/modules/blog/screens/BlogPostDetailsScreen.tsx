import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { FlatList, Platform, RefreshControl, View } from 'react-native';
import { NavigationActions, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import type { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import {
  FakeHeader,
  HeaderAction,
  HeaderCenter,
  HeaderLeft,
  HeaderRow,
  HeaderSubtitle,
  HeaderTitle,
} from '~/framework/components/header';
import { Icon } from '~/framework/components/icon';
import { ListItem } from '~/framework/components/listItem';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { TextSemiBold, TextLight } from '~/framework/components/text';
import NotificationTopInfo from '~/framework/modules/timelinev2/components/NotificationTopInfo';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { IResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';
import { Trackers } from '~/framework/util/tracker';
import { getBlogPostDetailsAction } from '~/modules/blog/actions';
import moduleConfig from '~/modules/blog/moduleConfig';
import type { IBlogPostComment, IBlogPost } from '~/modules/blog/reducer';
import { blogPostGenerateResourceUriFunction, blogUriCaptureFunction } from '~/modules/blog/service';
import { CommonStyles } from '~/styles/common/styles';
import { FlatButton } from '~/ui';
import { HtmlContentView } from '~/ui/HtmlContentView';
import { TextPreview } from '~/ui/TextPreview';
import { GridAvatars } from '~/ui/avatars/GridAvatars';
import { ContentCardHeader, ContentCardIcon, ResourceView } from '~/framework/components/card';
import { openUrl } from '~/framework/util/linking';

// TYPES ==========================================================================================

export interface IBlogPostDetailsScreenDataProps {
  // Add data props here
}
export interface IBlogPostDetailsScreenEventProps {
  handleGetBlogPostDetails(
    blogPostId: { blogId: string; postId: string },
    blogPostState?: string,
  ): Promise<IBlogPost | undefined>;
}
export interface IBlogPostDetailsScreenNavParams {
  notification: ITimelineNotification & IResourceUriNotification;
  blogPost?: IBlogPost;
  blogId?: string;
  useNotification?: boolean;
}
export type IBlogPostDetailsScreenProps = IBlogPostDetailsScreenDataProps &
  IBlogPostDetailsScreenEventProps &
  NavigationInjectedProps<Partial<IBlogPostDetailsScreenNavParams>>;

export enum BlogPostDetailsLoadingState {
  PRISTINE,
  INIT,
  REFRESH,
  DONE,
}
export interface IBlogPostDetailsScreenState {
  loadingState: BlogPostDetailsLoadingState;
  blogPostData: IBlogPost | undefined;
  errorState: boolean;
}

// COMPONENT ======================================================================================

export class BlogPostDetailsScreen extends React.PureComponent<IBlogPostDetailsScreenProps, IBlogPostDetailsScreenState> {
  // DECLARATIONS =================================================================================

  state: IBlogPostDetailsScreenState = {
    loadingState: BlogPostDetailsLoadingState.PRISTINE,
    blogPostData: undefined,
    errorState: false,
  };

  // RENDER =======================================================================================

  render() {
    const { loadingState, errorState } = this.state;
    return (
      <>
        {this.renderHeader()}
        <PageView>
          {[BlogPostDetailsLoadingState.PRISTINE, BlogPostDetailsLoadingState.INIT].includes(loadingState) ? (
            <LoadingIndicator />
          ) : errorState ? (
            this.renderError()
          ) : (
            this.renderContent()
          )}
        </PageView>
      </>
    );
  }

  renderHeader() {
    const { navigation } = this.props;
    const { blogPostData } = this.state;
    return (
      <FakeHeader>
        <HeaderRow>
          <HeaderLeft>
            <HeaderAction
              iconName={Platform.OS === 'ios' ? 'chevron-left1' : 'back'}
              iconSize={24}
              onPress={() => navigation.dispatch(NavigationActions.back())}
            />
          </HeaderLeft>
          <HeaderCenter>
            {blogPostData?.title ? (
              <>
                <HeaderTitle>{blogPostData?.title}</HeaderTitle>
                <HeaderSubtitle>{I18n.t('timeline.blogPostDetailsScreen.title')}</HeaderSubtitle>
              </>
            ) : (
              <HeaderTitle>{I18n.t('timeline.blogPostDetailsScreen.title')}</HeaderTitle>
            )}
          </HeaderCenter>
        </HeaderRow>
      </FakeHeader>
    );
  }

  renderError() {
    return <TextSemiBold>Error</TextSemiBold>; // ToDo: great error screen here
  }

  renderContent() {
    const { loadingState, blogPostData } = this.state;
    const blogPostComments = blogPostData?.comments;
    return (
      <FlatList
        data={blogPostComments}
        renderItem={({ item }: { item: IBlogPostComment }) => this.renderComment(item)}
        keyExtractor={(item: IBlogPostComment) => item.id.toString()}
        ListHeaderComponent={this.renderBlogPostDetails()}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 12, backgroundColor: theme.color.background.card }}
        scrollIndicatorInsets={{ right: 0.001 }} // 🍎 Hack to guarantee scrollbar to be stick on the right edge of the screen.
        refreshControl={
          <RefreshControl
            refreshing={[BlogPostDetailsLoadingState.REFRESH, BlogPostDetailsLoadingState.INIT].includes(loadingState)}
            onRefresh={() => this.doRefresh()}
          />
        }
      />
    );
  }

  renderBlogPostDetails() {
    const { navigation } = this.props;
    const { blogPostData } = this.state;
    const notification = navigation.getParam('useNotification', true) && navigation.getParam('notification');
    let resourceUri = notification && notification?.resource.uri;
    const blogPostContent = blogPostData?.content;
    const blogPostComments = blogPostData?.comments;
    const blogId = navigation.getParam('blogId');
    if (!resourceUri && blogPostData && blogId) {
      resourceUri = blogPostGenerateResourceUriFunction({ blogId, postId: blogPostData._id });
    }
    const hasComments = blogPostComments && blogPostComments.length > 0;
    return (
      <View>
        <View style={{ paddingHorizontal: 16 }}>
          <ResourceView
            header={
              notification ? (
                <NotificationTopInfo notification={notification} />
              ) : (
                <ContentCardHeader
                  icon={<ContentCardIcon userIds={[blogPostData?.author.userId || require('ASSETS/images/system-avatar.png')]} />}
                  text={
                    blogPostData?.author.username ? (
                      <TextSemiBold numberOfLines={1}>{`${I18n.t('common.by')} ${blogPostData?.author.username}`}</TextSemiBold>
                    ) : undefined
                  }
                  date={blogPostData?.modified}
                />
              )
            }>
            <HtmlContentView
              html={blogPostContent}
              onDownload={() => Trackers.trackEvent('Blog', 'DOWNLOAD ATTACHMENT', 'Read mode')}
              onError={() => Trackers.trackEvent('Blog', 'DOWNLOAD ATTACHMENT ERROR', 'Read mode')}
              onDownloadAll={() => Trackers.trackEvent('Blog', 'DOWNLOAD ALL ATTACHMENTS', 'Read mode')}
              onOpen={() => Trackers.trackEvent('Blog', 'OPEN ATTACHMENT', 'Read mode')}
            />
          </ResourceView>

          {resourceUri ? (
            <View style={{ marginTop: 10 }}>
              <FlatButton
                title={I18n.t('common.openInBrowser')}
                customButtonStyle={{ backgroundColor: theme.color.neutral.extraLight }}
                customTextStyle={{ color: theme.color.secondary.regular }}
                onPress={() => {
                  //TODO: create generic function inside oauth (use in myapps, etc.)
                  if (!DEPRECATED_getCurrentPlatform()) {
                    console.warn('Must have a platform selected to redirect the user');
                    return null;
                  }
                  const url = `${DEPRECATED_getCurrentPlatform()!.url}${resourceUri}`;
                  openUrl(url);
                  Trackers.trackEvent('Blog', 'GO TO', 'View in Browser');
                }}
              />
            </View>
          ) : null}
        </View>
        {hasComments ? (
          <ListItem
            style={{
              justifyContent: 'flex-start',
              shadowColor: theme.color.shadowColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              elevation: 2,
              borderBottomColor: undefined,
              borderBottomWidth: undefined,
              marginTop: 10,
              marginBottom: 4,
            }}
            leftElement={<Icon name="new_comment" color={theme.color.neutral.regular} size={16} style={{ marginRight: 5 }} />}
            rightElement={
              <TextLight>
                {blogPostComments!.length} {I18n.t(`common.comment${blogPostComments!.length > 1 ? 's' : ''}`)}
              </TextLight>
            }
          />
        ) : null}
      </View>
    );
  }

  renderComment(blogPostComment: IBlogPostComment) {
    return (
      <ListItem
        style={{ justifyContent: 'flex-start', backgroundColor: theme.color.secondary.extraLight }}
        leftElement={
          <GridAvatars
            users={[blogPostComment.author.userId || require('ASSETS/images/resource-avatar.png')]}
            fallback={require('ASSETS/images/resource-avatar.png')}
          />
        }
        rightElement={
          <View style={{ marginLeft: 15 }}>
            <View style={{ flexDirection: 'row' }}>
              <TextSemiBold numberOfLines={2} style={{ fontSize: 12, marginRight: 5, maxWidth: '70%' }}>
                {blogPostComment.author.username}
              </TextSemiBold>
              <TextLight style={{ fontSize: 10 }}>{moment(blogPostComment.created).fromNow()}</TextLight>
            </View>
            <TextPreview
              textContent={blogPostComment.comment}
              numberOfLines={5}
              textStyle={{
                color: CommonStyles.textColor,
                fontFamily: CommonStyles.primaryFontFamily,
                fontSize: 12,
                marginTop: 5,
              }}
              expandMessage={I18n.t('common.readMore')}
              expansionTextStyle={{ fontSize: 12 }}
            />
          </View>
        }
      />
    );
  }

  // LIFECYCLE ====================================================================================

  componentDidMount() {
    if (this.props.navigation.getParam('blogPost')) {
      this.setState({
        blogPostData: this.props.navigation.getParam('blogPost'),
        loadingState: BlogPostDetailsLoadingState.DONE,
      });
    } else this.doInit();
  }

  // METHODS ======================================================================================

  async doInit() {
    try {
      this.setState({ loadingState: BlogPostDetailsLoadingState.INIT });
      await this.doGetBlogPostDetails();
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

  async doGetBlogPostDetails() {
    try {
      const { navigation, handleGetBlogPostDetails } = this.props;
      let ids: { blogId: string; postId: string };
      let blogPostState: string | undefined = undefined;
      const notification = navigation.getParam('notification');
      if (notification && navigation.getParam('useNotification', true)) {
        const resourceUri = notification?.resource.uri;
        if (!resourceUri) {
          throw new Error('[doGetBlogPostDetails] failed to call api (resourceUri is undefined)');
        }
        ids = blogUriCaptureFunction(resourceUri) as Required<ReturnType<typeof blogUriCaptureFunction>>;
        if (!ids.blogId || !ids.postId) {
          throw new Error(`[doGetBlogPostDetails] failed to capture resourceUri "${resourceUri}": ${ids}`);
        }
        if (notification['event-type'] === 'SUBMIT-POST') blogPostState = 'SUBMITTED';
      } else {
        const blogId = this.props.navigation.getParam('blogId');
        const postId = this.props.navigation.getParam('blogPost')?._id;
        blogPostState = this.props.navigation.getParam('blogPost')?.state;
        if (!blogId || !postId) {
          throw new Error(`[doGetBlogPostDetails] missing blogId or postId : ${{ blogId, postId }}`);
        }
        ids = { blogId, postId };
      }
      const blogPostData = await handleGetBlogPostDetails(ids, blogPostState);
      this.setState({ blogPostData });
    } catch (e) {
      // ToDo: Error handling
      this.setState({ errorState: true });
      console.warn(`[${moduleConfig.name}] doGetBlogPostDetails failed`, e);
    }
  }
}

// UTILS ==========================================================================================

// Add some util functions here

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => IBlogPostDetailsScreenDataProps = s => ({});

const mapDispatchToProps: (
  dispatch: ThunkDispatch<any, any, any>,
  getState: () => IGlobalState,
) => IBlogPostDetailsScreenEventProps = (dispatch, getState) => ({
  handleGetBlogPostDetails: async (blogPostId: { blogId: string; postId: string }, blogPostState?: string) => {
    return (await dispatch(getBlogPostDetailsAction(blogPostId, blogPostState))) as unknown as IBlogPost | undefined;
  }, // TS BUG: dispatch mishandled
});

const BlogPostDetailsScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(BlogPostDetailsScreen);
export default BlogPostDetailsScreen_Connected;
