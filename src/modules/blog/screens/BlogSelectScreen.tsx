import I18n from 'i18n-js';
import * as React from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { Icon } from '~/framework/components/icon';
import { ListItem } from '~/framework/components/listItem';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { TextLight, TextSemiBold } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { computeRelativePath } from '~/framework/util/navigation';
import { getAuthHeader } from '~/infra/oauth';
import { getPublishableBlogListAction } from '~/modules/blog/actions';
import moduleConfig from '~/modules/blog/moduleConfig';
import { IBlog, IBlogList } from '~/modules/blog/reducer';
import { GridAvatars } from '~/ui/avatars/GridAvatars';
import { openUrl } from '~/framework/util/linking';
import { getBlogWorkflowInformation } from '../rights';
import { getUserSession, IUserSession } from '~/framework/util/session';
import EmptySearch from 'ode-images/empty-screen/empty-search.svg';

// TYPES ==========================================================================================

export interface IBlogSelectScreenDataProps {
  session: IUserSession;
}
export interface IBlogSelectScreenEventProps {
  handleGetPublishableBlogList(): Promise<IBlogList | undefined>;
}
export interface IBlogSelectScreenNavParams {
  // Add nav params here
}
export type IBlogSelectScreenProps = IBlogSelectScreenDataProps &
  IBlogSelectScreenEventProps &
  NavigationInjectedProps<Partial<IBlogSelectScreenNavParams>>;

export enum BlogSelectLoadingState {
  PRISTINE,
  INIT,
  REFRESH,
  DONE,
}
export interface IBlogSelectScreenState {
  loadingState: BlogSelectLoadingState;
  blogsData: IBlogList | undefined;
  errorState: boolean;
}

// COMPONENT ======================================================================================

export class BlogSelectScreen extends React.PureComponent<IBlogSelectScreenProps, IBlogSelectScreenState> {
  // DECLARATIONS =================================================================================

  state: IBlogSelectScreenState = {
    loadingState: BlogSelectLoadingState.PRISTINE,
    blogsData: undefined,
    errorState: false,
  };

  // RENDER =======================================================================================

  render() {
    const { loadingState, errorState } = this.state;
    return (
      <>
        <PageView
          navigation={this.props.navigation}
          navBarWithBack={{
            title: I18n.t('blog.blogSelectScreen.title'),
          }}>
          {[BlogSelectLoadingState.PRISTINE, BlogSelectLoadingState.INIT].includes(loadingState) ? (
            <LoadingIndicator />
          ) : errorState ? (
            this.renderError()
          ) : (
            this.renderList()
          )}
        </PageView>
      </>
    );
  }

  renderError() {
    return <TextSemiBold>Error</TextSemiBold>; // ToDo: great error screen here
  }

  renderList() {
    const { loadingState, blogsData } = this.state;
    const isEmpty = blogsData?.length === 0;
    return (
      <FlatList
        data={blogsData}
        renderItem={({ item }: { item: IBlog }) => this.renderBlog(item)}
        keyExtractor={(item: IBlog) => item.id.toString()}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: isEmpty ? undefined : 12,
          backgroundColor: theme.color.background.card,
        }}
        ListEmptyComponent={this.renderEmpty()}
        refreshControl={
          <RefreshControl
            refreshing={[BlogSelectLoadingState.REFRESH, BlogSelectLoadingState.INIT].includes(loadingState)}
            onRefresh={() => this.doRefresh()}
          />
        }
      />
    );
  }

  renderEmpty() {
    const { session } = this.props;
    const hasBlogCreationRights = getBlogWorkflowInformation(session)?.blog.create;
    return (
      <EmptyScreen
        svgImage={<EmptySearch />}
        title={I18n.t('blog.blogsEmptyScreen.title')}
        text={I18n.t(`blog.blogsEmptyScreen.text${hasBlogCreationRights ? '' : 'NoCreationRights'}`)}
        buttonText={hasBlogCreationRights ? I18n.t('blog.blogsEmptyScreen.button') : undefined}
        buttonAction={() => {
          //TODO: create generic function inside oauth (use in myapps, etc.)
          if (!DEPRECATED_getCurrentPlatform()) {
            console.warn('Must have a platform selected to redirect the user');
            return null;
          }
          const url = `${DEPRECATED_getCurrentPlatform()!.url}/blog#/edit/new`;
          openUrl(url);
        }}
      />
    );
  }

  renderBlog(blog: IBlog) {
    const { navigation } = this.props;
    const blogShareNumber = blog.shared?.length;
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate(computeRelativePath(`${moduleConfig.routeName}/create`, navigation.state), { blog })}>
        <ListItem
          leftElement={
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <GridAvatars
                users={[
                  blog.thumbnail
                    ? { headers: getAuthHeader(), uri: DEPRECATED_getCurrentPlatform()!.url + blog.thumbnail }
                    : require('ASSETS/images/resource-avatar.png'),
                ]}
                fallback={require('ASSETS/images/resource-avatar.png')}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <TextSemiBold numberOfLines={1}>{blog.title}</TextSemiBold>
                <TextLight style={{ fontSize: 12, marginTop: 8 }}>
                  {I18n.t(`blog.blogSelectScreen.sharedToNbPerson${blogShareNumber === 1 ? '' : 's'}`, {
                    nb: blogShareNumber || 0,
                  })}
                </TextLight>
              </View>
            </View>
          }
          rightElement={<Icon name="arrow_down" color="#868CA0" style={{ transform: [{ rotate: '270deg' }] }} />}
        />
      </TouchableOpacity>
    );
  }

  // LIFECYCLE ====================================================================================

  componentDidMount() {
    this.doInit();
  }

  // METHODS ======================================================================================

  async doInit() {
    try {
      this.setState({ loadingState: BlogSelectLoadingState.INIT });
      await this.doGetPublishableBlogList();
    } finally {
      this.setState({ loadingState: BlogSelectLoadingState.DONE });
    }
  }

  async doRefresh() {
    try {
      this.setState({ loadingState: BlogSelectLoadingState.REFRESH });
      await this.doGetPublishableBlogList();
    } finally {
      this.setState({ loadingState: BlogSelectLoadingState.DONE });
    }
  }

  async doGetPublishableBlogList() {
    try {
      const { handleGetPublishableBlogList } = this.props;
      const blogsData = await handleGetPublishableBlogList();
      if (!blogsData) {
        throw new Error('[doGetPublishableBlogList] failed to retrieve the publishable blog list');
      }
      this.setState({ blogsData });
    } catch (e) {
      // ToDo: Error handling
      this.setState({ errorState: true });
      console.warn(`[${moduleConfig.name}] doGetPublishableBlogList failed`, e);
    }
  }
}

// UTILS ==========================================================================================

// Add some util functions here

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => IBlogSelectScreenDataProps = s => ({ session: getUserSession(s) });

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => IBlogSelectScreenEventProps = (
  dispatch,
  getState,
) => ({
  handleGetPublishableBlogList: async () => {
    const blogs = (await dispatch(getPublishableBlogListAction())) as unknown as IBlogList;
    return blogs;
  },
});

const BlogSelectScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(BlogSelectScreen);
export default BlogSelectScreen_Connected;
