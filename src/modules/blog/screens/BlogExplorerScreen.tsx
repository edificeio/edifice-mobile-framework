/**
 * Blog explorer
 */

import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { Linking, Platform, RefreshControl, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationActions, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { Drawer } from '~/framework/components/drawer';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import Explorer, {
  IExplorerFolderItem,
  IExplorerResourceItemWithIcon,
  IExplorerResourceItemWithImage,
} from '~/framework/components/explorer';
import { FakeHeader, HeaderAction, HeaderCenter, HeaderLeft, HeaderRow, HeaderTitle } from '~/framework/components/header';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncLoadingState } from '~/framework/util/redux/async';
import { getUserSession, IUserSession } from '~/framework/util/session';
import { signURISource, transformedSrc } from '~/infra/oauth';
import { fetchBlogsAndFoldersAction } from '~/modules/blog/actions';
import moduleConfig from '~/modules/blog/moduleConfig';
import { filterTrashed, getFolderContent, IBlog, IBlogFolder } from '~/modules/blog/reducer';
import { getBlogWorkflowInformation } from '~/modules/blog/rights';

// TYPES ==========================================================================================

export interface IBlogExplorerScreen_DataProps {
  blogs?: IBlog[];
  folders?: IBlogFolder[];
  initialLoadingState: AsyncLoadingState;
  error?: Error;
  session: IUserSession;
}
export interface IBlogExplorerScreen_EventProps {
  doFetch: () => Promise<[IBlog[], IBlogFolder[]] | undefined>;
}
export interface IBlogExplorerScreen_NavigationParams {
  folderId?: string;
  filter?: 'trash' | 'public' | 'sharedWithMe';
}
export type IBlogExplorerScreen_Props = IBlogExplorerScreen_DataProps &
  IBlogExplorerScreen_EventProps &
  NavigationInjectedProps<IBlogExplorerScreen_NavigationParams>;

// COMPONENT ======================================================================================

const BlogExplorerScreen = (props: IBlogExplorerScreen_Props) => {
  const render = [] as React.ReactNode[];
  const insets = useSafeAreaInsets();
  const hasBlogCreationRights = getBlogWorkflowInformation(props.session) && getBlogWorkflowInformation(props.session).blog.create;

  // LOADER =====================================================================================

  // ToDo : Make this in a useLoadingState.

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState);

  React.useEffect(() => {
    // console.log("user effect ?", loadingState);
    if (loadingState === AsyncLoadingState.PRISTINE) {
      setLoadingState(AsyncLoadingState.INIT);
      props
        .doFetch()
        .then(() => setLoadingState(AsyncLoadingState.DONE))
        .catch(() => setLoadingState(AsyncLoadingState.INIT_FAILED));
    }
  }, []);

  const reload = () => {
    setLoadingState(AsyncLoadingState.RETRY);
    props
      .doFetch()
      .then(() => setLoadingState(AsyncLoadingState.DONE))
      .catch(() => setLoadingState(AsyncLoadingState.INIT_FAILED));
  };

  const refresh = () => {
    setLoadingState(AsyncLoadingState.REFRESH);
    props
      .doFetch()
      .then(() => setLoadingState(AsyncLoadingState.DONE))
      .catch(() => setLoadingState(AsyncLoadingState.REFRESH_FAILED));
  };

  // EVENTS =====================================================================================

  type IDisplayedBlog = Omit<IBlog, 'thumbnail'>;
  const onOpenItem = (
    item:
      | (IExplorerFolderItem & IBlogFolder)
      | (IExplorerResourceItemWithImage & IDisplayedBlog)
      | (IExplorerResourceItemWithIcon & IDisplayedBlog),
  ) => {
    console.log('onOpenItem', item);
    if (item.type === 'folder') {
      props.navigation.setParams({ folderId: item.id });
    } else if (item.type === 'resource') {
    } else {
      // No-op
    }
  };

  // HEADER =====================================================================================

  render.push(
    <FakeHeader>
      <HeaderRow>
        <HeaderLeft>
          <HeaderAction
            iconName={Platform.OS === 'ios' ? 'chevron-left1' : 'back'}
            iconSize={24}
            onPress={() => props.navigation.dispatch(NavigationActions.back())}
          />
        </HeaderLeft>
        <HeaderCenter>
          <HeaderTitle>{I18n.t('blog.appName')}</HeaderTitle>
        </HeaderCenter>
      </HeaderRow>
    </FakeHeader>,
  );

  // RENDER =====================================================================================

  switch (loadingState) {
    case AsyncLoadingState.DONE:
    case AsyncLoadingState.REFRESH:
    case AsyncLoadingState.REFRESH_FAILED:
      let { blogs, folders } = getFolderContent(props.blogs!, props.folders!, props.navigation.getParam('folderId'));
      blogs = filterTrashed(blogs, props.navigation.getParam('filter') === 'trash');
      folders = filterTrashed(folders, props.navigation.getParam('filter') === 'trash');
      const foldersHierarchy = [];

      // Drawer

      render.push(
        <View style={{ marginBottom: 45, zIndex: 1 }}>
          <Drawer
            items={[
              {
                name: 'Root',
                value: 'root',
                iconName: 'folder1',
                depth: 0,
              },
              ...(props.folders || []).map(f => ({
                name: f.name,
                value: f.id,
                iconName: 'folder1',
                depth: 1,
              })),
            ]}
            selectItem={item => console.log('selected', item)}
            selectedItem={props.navigation.getParam('folderId', 'root')}
          />
        </View>,
      );

      // Explorer

      render.push(
        <>
          <Explorer
            folders={folders.map(f => ({ ...f, color: theme.themeOpenEnt.indigo }))}
            resources={blogs
              .map(bb => {
                const { thumbnail, ...b } = bb;
                return {
                  ...b,
                  color: theme.themeOpenEnt.indigo,
                  date: moment.max(
                    b.fetchPosts?.[0]?.firstPublishDate ??
                      b.fetchPosts?.[0]?.modified ??
                      b.fetchPosts?.[0]?.created ??
                      b.modified ??
                      b.created,
                    b.modified ?? b.created,
                  ),
                  ...(thumbnail ? { thumbnail: signURISource(transformedSrc(thumbnail)) } : { icon: 'bullhorn' }),
                };
              })
              .sort((a, b) => b.date.valueOf() - a.date.valueOf())}
            onItemPress={onOpenItem}
            ListFooterComponent={<View style={{ marginBottom: insets.bottom }} />}
            refreshControl={<RefreshControl refreshing={loadingState === AsyncLoadingState.REFRESH} onRefresh={() => refresh()} />}
            ListEmptyComponent={renderEmpty(hasBlogCreationRights)}
            contentContainerStyle={{ flexGrow: 1 }}
          />
        </>,
      );
      break;

    case AsyncLoadingState.PRISTINE:
    case AsyncLoadingState.INIT:
      render.push(<LoadingIndicator />);
      break;

    case AsyncLoadingState.INIT_FAILED:
    case AsyncLoadingState.RETRY:
      render.push(
        <ScrollView
          refreshControl={<RefreshControl refreshing={loadingState === AsyncLoadingState.RETRY} onRefresh={() => reload()} />}>
          <EmptyContentScreen />
        </ScrollView>,
      );
      break;
  }
  return <PageView path={props.navigation.state.routeName}>{render}</PageView>;
};

const renderEmpty = hasBlogCreationRights => {
  return (
    <EmptyScreen
      imageSrc={require('ASSETS/images/empty-screen/empty-search.png')}
      imgWidth={265.98}
      imgHeight={279.97}
      customStyle={{ backgroundColor: theme.color.background.card }}
      title={I18n.t('blog.blogExplorerScreen.emptyScreenTitle')}
      text={I18n.t(`blog.blogExplorerScreen.emptyScreenText${hasBlogCreationRights ? '' : 'NoCreationRights'}`)}
      buttonText={hasBlogCreationRights ? I18n.t('blog.blogExplorerScreen.emptyScreenButton') : undefined}
      buttonAction={() => {
        //TODO: create generic function inside oauth (use in myapps, etc.)
        if (!DEPRECATED_getCurrentPlatform()) {
          console.warn('Must have a platform selected to redirect the user');
          return null;
        }
        const url = `${DEPRECATED_getCurrentPlatform()!.url}/blog#/edit/new`;
        Linking.canOpenURL(url).then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            console.warn("[blog] Don't know how to open URI: ", url);
          }
        });
      }}
    />
  );
};

// MAPPING ========================================================================================

export default connect(
  (gs: IGlobalState) => {
    const bs = moduleConfig.getState(gs);
    return {
      session: getUserSession(gs),
      blogs: bs.blogs.data,
      folders: bs.folders.data,
      initialLoadingState: bs.folders.isPristine || bs.blogs.isPristine ? AsyncLoadingState.PRISTINE : AsyncLoadingState.DONE,
      error: bs.blogs.error ?? bs.folders.error,
    };
  },
  dispatch =>
    bindActionCreators(
      {
        doFetch: tryAction(fetchBlogsAndFoldersAction, undefined, true) as any, // FUCK OFF REACT-REDUX YOUR TYPES DEFINITIONS SUCKS
      },
      dispatch,
    ),
)(BlogExplorerScreen);
