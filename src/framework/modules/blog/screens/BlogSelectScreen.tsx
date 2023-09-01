import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen, EmptyScreen } from '~/framework/components/empty-screens';
import { ListItem } from '~/framework/components/listItem';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyBoldText, SmallText } from '~/framework/components/text';
import { ISession } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { getPublishableBlogListAction } from '~/framework/modules/blog/actions';
import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';
import { Blog, BlogList } from '~/framework/modules/blog/reducer';
import { getBlogWorkflowInformation } from '~/framework/modules/blog/rights';
import { navBarOptions } from '~/framework/navigation/navBar';
import { Image } from '~/framework/util/media';

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
  blogItemImage: {
    width: UI_SIZES.elements.avatar.lg,
    aspectRatio: UI_SIZES.aspectRatios.square,
    borderRadius: UI_SIZES.radius.medium,
  },
  blogItemNoImage: {
    backgroundColor: theme.palette.complementary.indigo.pale,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('blog-select-title'),
  }),
});

const BlogItem = ({ blog, navigation }: { blog: Blog; navigation: any }) => {
  const [thumbnailError, setThumbnailError] = React.useState(false);

  const blogShareNumber = blog.shared?.length;

  return (
    <TouchableOpacity onPress={() => navigation.navigate(blogRouteNames.blogCreatePost, { blog })}>
      <ListItem
        leftElement={
          <View style={styles.blogItem}>
            {blog.thumbnail && !thumbnailError ? (
              <Image source={{ uri: blog.thumbnail }} style={styles.blogItemImage} onError={() => setThumbnailError(true)} />
            ) : (
              <View style={[styles.blogItemImage, styles.blogItemNoImage]}>
                <NamedSVG name="blog" fill={theme.palette.complementary.indigo.regular} width={32} height={32} />
              </View>
            )}
            <View style={styles.blogItemTexts}>
              <BodyBoldText numberOfLines={1}>{blog.title}</BodyBoldText>
              <SmallText>
                {I18n.get(`blog-select-sharedtonbperson${blogShareNumber === 1 ? '' : 's'}`, {
                  nb: blogShareNumber || 0,
                })}
              </SmallText>
            </View>
          </View>
        }
        rightElement={
          <NamedSVG
            name="ui-rafterRight"
            fill={theme.palette.primary.regular}
            width={UI_SIZES.elements.icon.small}
            height={UI_SIZES.elements.icon.small}
          />
        }
      />
    </TouchableOpacity>
  );
};

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
    return <EmptyConnectionScreen />;
  }

  renderList() {
    const { loadingState, blogsData } = this.state;
    const isEmpty = blogsData?.length === 0;
    return (
      <FlatList
        data={blogsData}
        renderItem={({ item }: { item: Blog }) => <BlogItem blog={item} navigation={this.props.navigation} />}
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
        title={I18n.get('blog-select-emptyscreen-title')}
        text={I18n.get(`blog-select-emptyscreen-text${hasBlogCreationRights ? '' : '-nocreationrights'}`)}
        buttonText={hasBlogCreationRights ? I18n.get('blog-select-emptyscreen-button') : undefined}
        buttonUrl="/blog#/edit/new"
      />
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
