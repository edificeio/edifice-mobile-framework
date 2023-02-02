import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import type { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import FlatList from '~/framework/components/flatList';
import { Icon } from '~/framework/components/icon';
import { ListItem } from '~/framework/components/listItem';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { CaptionBoldText, CaptionText, SmallText } from '~/framework/components/text';
import NotificationTopInfo from '~/framework/modules/timelinev2/components/NotificationTopInfo';
import { navBarOptions } from '~/framework/navigation/navBar';
import { Trackers } from '~/framework/util/tracker';
import { getNewsDetailsAction } from '~/modules/news/actions';
import type { INews, INewsComment } from '~/modules/news/reducer';
import { newsUriCaptureFunction } from '~/modules/news/service';
import { HtmlContentView } from '~/ui/HtmlContentView';
import { TextPreview } from '~/ui/TextPreview';
import { GridAvatars } from '~/ui/avatars/GridAvatars';

import { NewsNavigationParams, newsRouteNames } from '../navigation';
import type { INewsNotification } from '../notif-handler';

export interface INewsDetailsScreenDataProps {
  // Add data props here
}
export interface INewsDetailsScreenEventProps {
  handleGetNewsDetails(newsId: { threadId: string; infoId: string }): Promise<INews | undefined>;
}
export interface NewsDetailsScreenNavParams {
  notification?: INewsNotification;
  title?: string;
}
export type INewsDetailsScreenProps = INewsDetailsScreenDataProps &
  INewsDetailsScreenEventProps &
  NativeStackScreenProps<NewsNavigationParams, typeof newsRouteNames.newsDetails>;

export enum NewsDetailsLoadingState {
  PRISTINE,
  INIT,
  REFRESH,
  DONE,
}
export interface INewsDetailsScreenState {
  loadingState: NewsDetailsLoadingState;
  newsData: INews | undefined;
  errorState: boolean;
}

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<NewsNavigationParams, typeof newsRouteNames.newsDetails>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: route.params.title ?? I18n.t('timeline.newsDetailsScreen.title'),
});

const styles = StyleSheet.create({
  actionButton: {
    borderWidth: 0,
    backgroundColor: theme.palette.grey.fog,
  },
  boxComments: {
    justifyContent: 'flex-start',
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 2,
    borderBottomColor: undefined,
    borderBottomWidth: undefined,
    marginTop: UI_SIZES.spacing.small,
    marginBottom: UI_SIZES.spacing.tiny,
  },
  comment: {
    flexDirection: 'row',
  },
  commentItem: {
    justifyContent: 'flex-start',
    backgroundColor: theme.palette.primary.pale,
  },
  commentUser: {
    marginRight: UI_SIZES.spacing.minor,
    maxWidth: '70%',
  },
  content: {
    flexGrow: 1,
    paddingVertical: UI_SIZES.spacing.small,
    backgroundColor: theme.ui.background.card,
  },
});

export class NewsDetailsScreen extends React.PureComponent<INewsDetailsScreenProps, INewsDetailsScreenState> {
  state: INewsDetailsScreenState = {
    loadingState: NewsDetailsLoadingState.PRISTINE,
    newsData: undefined,
    errorState: false,
  };

  async doInit() {
    try {
      this.setState({ loadingState: NewsDetailsLoadingState.INIT });
      await this.doGetNewsDetails();
    } finally {
      this.setState({ loadingState: NewsDetailsLoadingState.DONE });
    }
  }

  async doRefresh() {
    try {
      this.setState({ loadingState: NewsDetailsLoadingState.REFRESH });
      await this.doGetNewsDetails();
    } finally {
      this.setState({ loadingState: NewsDetailsLoadingState.DONE });
    }
  }

  async doGetNewsDetails() {
    try {
      const { handleGetNewsDetails } = this.props;
      const notification = this.props.route.params.notification;
      const resourceUri = notification?.resource.uri;
      if (!resourceUri) {
        throw new Error('[doGetNewsDetails] failed to call api (resourceUri is undefined)');
      }
      const newsId = newsUriCaptureFunction(resourceUri);
      const { threadId, infoId } = newsId;
      if (!threadId || !infoId) {
        throw new Error(`[doGetNewsDetails] failed to capture resourceUri "${resourceUri}": ${{ threadId, infoId }}`);
      }
      const newsData = await handleGetNewsDetails(newsId as Required<typeof newsId>);
      this.setState({ newsData });
    } catch {
      // ToDo: Error handling
      this.setState({ errorState: true });
    }
  }

  componentDidMount() {
    this.doInit();
  }

  componentDidUpdate(
    prevProps: Readonly<INewsDetailsScreenProps>,
    prevState: Readonly<INewsDetailsScreenState>,
    snapshot?: any,
  ): void {
    console.debug(prevState.newsData?.title, this.state.newsData?.title);
    if (prevState.newsData?.title !== this.state.newsData?.title) {
      this.props.navigation.setParams({
        title: this.state.newsData?.title ?? I18n.t('timeline.newsDetailsScreen.title'),
      });
    }
  }

  renderError() {
    return <EmptyContentScreen />;
  }

  renderContent() {
    const { loadingState, newsData } = this.state;
    const newsComments = newsData?.comments;
    return (
      <FlatList
        data={newsComments}
        renderItem={({ item }: { item: INewsComment }) => this.renderComment(item)}
        keyExtractor={(item: INewsComment) => item._id.toString()}
        ListHeaderComponent={this.renderNewsDetails()}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={[NewsDetailsLoadingState.REFRESH, NewsDetailsLoadingState.INIT].includes(loadingState)}
            onRefresh={() => this.doRefresh()}
          />
        }
      />
    );
  }

  renderNewsDetails() {
    const { newsData } = this.state;
    const notification = this.props.route.params.notification;
    const resourceUri = notification?.resource.uri;
    const newsContent = newsData?.content;
    const newsComments = newsData?.comments;
    const hasComments = newsComments && newsComments.length > 0;
    return (
      <View>
        <View style={{ paddingHorizontal: UI_SIZES.spacing.medium }}>
          {notification ? <NotificationTopInfo notification={notification} /> : null}
          <HtmlContentView
            html={newsContent}
            onHtmlError={() => this.setState({ errorState: true })}
            onDownload={() => Trackers.trackEvent('News', 'DOWNLOAD ATTACHMENT', 'Read mode')}
            onError={() => Trackers.trackEvent('News', 'DOWNLOAD ATTACHMENT ERROR', 'Read mode')}
            onDownloadAll={() => Trackers.trackEvent('News', 'DOWNLOAD ALL ATTACHMENTS', 'Read mode')}
            onOpen={() => Trackers.trackEvent('News', 'OPEN ATTACHMENT', 'Read mode')}
          />
          {resourceUri ? (
            <View style={{ marginTop: UI_SIZES.spacing.small }}>
              <ActionButton
                text={I18n.t('common.openInBrowser')}
                url={resourceUri}
                action={() => Trackers.trackEvent('News', 'GO TO', 'View in Browser')}
                type="secondary"
                style={styles.actionButton}
              />
            </View>
          ) : null}
        </View>
        {hasComments ? (
          <ListItem
            style={styles.boxComments}
            leftElement={
              <Icon name="new_comment" color={theme.ui.text.light} size={16} style={{ marginRight: UI_SIZES.spacing.minor }} />
            }
            rightElement={
              <SmallText>
                {newsComments!.length} {I18n.t(`common.comment.comment${newsComments!.length > 1 ? 's' : ''}`)}
              </SmallText>
            }
          />
        ) : null}
      </View>
    );
  }

  renderComment(newsComment: INewsComment) {
    return (
      <ListItem
        style={styles.commentItem}
        leftElement={
          <GridAvatars
            users={[newsComment.owner || require('ASSETS/images/resource-avatar.png')]}
            fallback={require('ASSETS/images/resource-avatar.png')}
          />
        }
        rightElement={
          <View style={{ marginLeft: UI_SIZES.spacing.medium }}>
            <View style={styles.comment}>
              <CaptionBoldText numberOfLines={2} style={styles.commentUser}>
                {newsComment.username}
              </CaptionBoldText>
              <CaptionText>{moment(newsComment.created).fromNow()}</CaptionText>
            </View>
            <TextPreview textContent={newsComment.comment} />
          </View>
        }
      />
    );
  }

  render() {
    const { loadingState, errorState } = this.state;
    return (
      <PageView>
        {[NewsDetailsLoadingState.PRISTINE, NewsDetailsLoadingState.INIT].includes(loadingState) ? (
          <LoadingIndicator />
        ) : errorState ? (
          this.renderError()
        ) : (
          this.renderContent()
        )}
      </PageView>
    );
  }
}

const mapStateToProps: (s: IGlobalState) => INewsDetailsScreenDataProps = s => ({});

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => INewsDetailsScreenEventProps = (
  dispatch,
  getState,
) => ({
  handleGetNewsDetails: async (newsId: { threadId: string; infoId: string }) => {
    return (await dispatch(getNewsDetailsAction(newsId))) as unknown as INews | undefined;
  }, // TS BUG: dispatch mishandled
});

const NewsDetailsScreenConnected = connect(mapStateToProps, mapDispatchToProps)(NewsDetailsScreen);
export default NewsDetailsScreenConnected;
