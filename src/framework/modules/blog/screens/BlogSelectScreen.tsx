import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { Icon } from '~/framework/components/icon';
import { ListItem } from '~/framework/components/listItem';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { CaptionText, SmallBoldText } from '~/framework/components/text';
import { ISession } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { getPublishableBlogListAction } from '~/framework/modules/blog/actions';
import moduleConfig from '~/framework/modules/blog/module-config';
import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';
import { Blog, BlogList } from '~/framework/modules/blog/reducer';
import { getBlogWorkflowInformation } from '~/framework/modules/blog/rights';
import { navBarOptions } from '~/framework/navigation/navBar';
import { GridAvatars } from '~/ui/avatars/GridAvatars';

export interface BlogSelectScreenDataProps {
  session?: ISession;
}
export interface BlogSelectScreenEventProps {
  handleGetPublishableBlogList(): Promise<BlogList | undefined>;
}
export interface BlogSelectScreenNavParams {
  // Add nav params here
}
export type BlogSelectScreenProps = BlogSelectScreenDataProps &
  BlogSelectScreenEventProps &
  NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.home>;

export enum BlogSelectLoadingState {
  PRISTINE,
  INIT,
  REFRESH,
  DONE,
}
export interface BlogSelectScreenState {
  loadingState: BlogSelectLoadingState;
  blogsData: BlogList | undefined;
  errorState: boolean;
}

const styles = StyleSheet.create({
  blogItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  blogItemTexts: {
    flex: 1,
    marginLeft: UI_SIZES.spacing.small,
  },
  listBlog: {
    flexGrow: 1,
  },
});

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.t('blog.blogSelectScreen.title'),
  }),
});

export class BlogSelectScreen extends React.PureComponent<BlogSelectScreenProps, BlogSelectScreenState> {
  state: BlogSelectScreenState = {
    loadingState: BlogSelectLoadingState.PRISTINE,
    blogsData: undefined,
    errorState: false,
  };

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
    } catch {
      // ToDo: Error handling
      this.setState({ errorState: true });
    }
  }

  componentDidMount() {
    this.doInit();
  }

  renderError() {
    return <SmallBoldText>Error</SmallBoldText>; // ToDo: great error screen here
  }

  renderList() {
    const { loadingState, blogsData } = this.state;
    const isEmpty = blogsData?.length === 0;
    return (
      <FlatList
        data={blogsData}
        renderItem={({ item }: { item: Blog }) => this.renderBlog(item)}
        keyExtractor={(item: Blog) => item.id.toString()}
        contentContainerStyle={[
          styles.listBlog,
          {
            paddingBottom: isEmpty ? undefined : UI_SIZES.screen.bottomInset,
          },
        ]}
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
    const hasBlogCreationRights = session && getBlogWorkflowInformation(session)?.blog.create;
    return (
      <EmptyScreen
        svgImage="empty-search"
        title={I18n.t('blog.blogsEmptyScreen.title')}
        text={I18n.t(`blog.blogsEmptyScreen.text${hasBlogCreationRights ? '' : 'NoCreationRights'}`)}
        buttonText={hasBlogCreationRights ? I18n.t('blog.blogsEmptyScreen.button') : undefined}
        buttonUrl="/blog#/edit/new"
      />
    );
  }

  renderBlog(blog: Blog) {
    const { navigation } = this.props;
    const blogShareNumber = blog.shared?.length;
    return (
      <TouchableOpacity onPress={() => navigation.navigate(`${moduleConfig.routeName}/create`, { blog })}>
        <ListItem
          leftElement={
            <View style={styles.blogItem}>
              <GridAvatars
                users={[blog.thumbnail ? { uri: blog.thumbnail } : require('ASSETS/images/resource-avatar.png')]}
                fallback={require('ASSETS/images/resource-avatar.png')}
              />
              <View style={styles.blogItemTexts}>
                <SmallBoldText numberOfLines={1}>{blog.title}</SmallBoldText>
                <CaptionText style={{ marginTop: UI_SIZES.spacing.minor }}>
                  {I18n.t(`blog.blogSelectScreen.sharedToNbPerson${blogShareNumber === 1 ? '' : 's'}`, {
                    nb: blogShareNumber || 0,
                  })}
                </CaptionText>
              </View>
            </View>
          }
          rightElement={
            <Icon name="arrow_down" color={theme.palette.grey.graphite} style={{ transform: [{ rotate: '270deg' }] }} />
          }
        />
      </TouchableOpacity>
    );
  }

  render() {
    const { loadingState, errorState } = this.state;
    return (
      <>
        <PageView>
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
}

const mapStateToProps: (s: IGlobalState) => BlogSelectScreenDataProps = s => ({ session: getSession() });

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => BlogSelectScreenEventProps = (
  dispatch,
  getState,
) => ({
  handleGetPublishableBlogList: async () => {
    const blogs = (await dispatch(getPublishableBlogListAction())) as unknown as BlogList;
    return blogs;
  },
});

const BlogSelectScreenConnected = connect(mapStateToProps, mapDispatchToProps)(BlogSelectScreen);
export default BlogSelectScreenConnected;
