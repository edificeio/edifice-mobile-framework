/**
 * Blog explorer
 */

import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { Platform, RefreshControl, View, ScrollView } from 'react-native';
import { NavigationActions, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import Explorer, {
  IExplorerFolderItem,
  IExplorerResourceItemWithIcon,
  IExplorerResourceItemWithImage,
} from '~/framework/components/explorer';
import {
  FakeHeader,
  HeaderAction,
  HeaderCenter,
  HeaderLeft,
  HeaderRow,
  HeaderSubtitle,
  HeaderTitle,
} from '~/framework/components/header';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncLoadingState } from '~/framework/util/redux/async';
import { getUserSession, IUserSession } from '~/framework/util/session';
import { fetchBlogsAndFoldersAction } from '~/modules/blog/actions';
import moduleConfig from '~/modules/blog/moduleConfig';
import { IBlog, IBlogFolder, IBlogFolderWithChildren, IBlogFolderWithResources, IBlogFlatTree } from '~/modules/blog/reducer';
import { getBlogWorkflowInformation } from '~/modules/blog/rights';
import { signURISource, transformedSrc } from '~/infra/oauth';
import { openUrl } from '~/framework/util/linking';
import EmptySearch from 'ode-images/empty-screen/empty-search.svg';

// TYPES ==========================================================================================

export interface IBlogExplorerScreen_DataProps {
  tree?: IBlogFlatTree;
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

export type IDisplayedBlog = Omit<IBlog, 'thumbnail'>;

// COMPONENT ======================================================================================

const BlogExplorerScreen = (props: IBlogExplorerScreen_Props) => {
  const hasBlogCreationRights = getBlogWorkflowInformation(props.session) && getBlogWorkflowInformation(props.session).blog.create;

  // LOADER =====================================================================================

  // ToDo : Make this in a useLoadingState.

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState);

  React.useEffect(() => {
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

  const onOpenItem = (
    item:
      | (IExplorerFolderItem & IBlogFolder)
      | (IExplorerResourceItemWithImage & IDisplayedBlog)
      | (IExplorerResourceItemWithIcon & IDisplayedBlog),
  ) => {
    if (item.type === 'folder') {
      onOpenFolder(item);
    } else if (item.type === 'resource') {
      onOpenBlog(item);
    } else {
      // No-op
    }
  };
  const onOpenFolder = (item: IBlogFolder | 'root') => {
    props.navigation.push(`${moduleConfig.routeName}`, { folderId: item === 'root' ? undefined : item.id });
  };
  const onOpenBlog = (item: IDisplayedBlog) => {
    props.navigation.navigate(`${moduleConfig.routeName}/posts`, { selectedBlog: item });
  };

  // HEADER =====================================================================================

  const renderHeader = ({
    resources,
    folders,
  }: {
    resources: IBlog[];
    folders: (IBlogFolderWithChildren & IBlogFolderWithResources & { depth: number })[];
  }) => {
    const currentFolderId = props.navigation.getParam('folderId');
    const currentFolder = folders.find(f => f.id === currentFolderId);
    return (
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
            {currentFolder ? (
              <>
                <HeaderTitle numberOfLines={1}>{currentFolder.name}</HeaderTitle>
                <HeaderSubtitle>{I18n.t('blog.appName')}</HeaderSubtitle>
              </>
            ) : (
              <HeaderTitle>{I18n.t('blog.appName')}</HeaderTitle>
            )}
          </HeaderCenter>
        </HeaderRow>
      </FakeHeader>
    );
  };

  // EMPTY SCREEN =================================================================================

  const renderEmpty = () => {
    return (
      <EmptyScreen
        customStyle={{ backgroundColor: theme.color.background.card }}
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
  };

  // ERROR ========================================================================================

  const renderError = () => {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={loadingState === AsyncLoadingState.RETRY} onRefresh={() => reload()} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  // EXPLORER ====================================================================================

  const renderExplorer = ({
    resources,
    folders,
  }: {
    resources: IBlog[];
    folders: (IBlogFolderWithChildren & IBlogFolderWithResources & { depth: number })[];
  }) => {
    const currentFolderId = props.navigation.getParam('folderId');
    const currentFolder = folders.find(f => f.id === currentFolderId);
    if (currentFolderId && !currentFolder) {
      return <EmptyContentScreen />;
    }
    const finalFolders = currentFolder ? currentFolder!.children || [] : folders.filter(f => f.depth === 0);
    const finalBlogs = currentFolder ? currentFolder!.resources || [] : resources;

    // Format data

    const { displayedblogs, displayedFolders } = (() => {
      const displayedblogs = finalBlogs
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
        .sort((a, b) => b.date.valueOf() - a.date.valueOf());

      const displayedFolders = finalFolders.map(f => ({ ...f, color: theme.themeOpenEnt.indigo }));
      return { displayedblogs, displayedFolders };
    })();

    return (
      <Explorer
        folders={displayedFolders}
        resources={displayedblogs}
        onItemPress={onOpenItem}
        ListFooterComponent={<View style={{ paddingBottom: UI_SIZES.bottomInset }} />}
        refreshControl={<RefreshControl refreshing={loadingState === AsyncLoadingState.REFRESH} onRefresh={() => refresh()} />}
        ListEmptyComponent={renderEmpty()}
        contentContainerStyle={{ flexGrow: 1 }}
        keyExtractor={item => item.id}
      />
    );
  };

  // RENDER =======================================================================================

  const renderPage = () => {
    switch (loadingState) {
      case AsyncLoadingState.DONE:
      case AsyncLoadingState.REFRESH:
      case AsyncLoadingState.REFRESH_FAILED:
        return <>{renderExplorer(props.tree || { resources: [], folders: [] })}</>;

      case AsyncLoadingState.PRISTINE:
      case AsyncLoadingState.INIT:
        return <LoadingIndicator />;

      case AsyncLoadingState.INIT_FAILED:
      case AsyncLoadingState.RETRY:
        return renderError();
    }
  };

  return (
    <>
      {renderHeader(props.tree || { resources: [], folders: [] })}
      <PageView path={props.navigation.state.routeName}>{renderPage()}</PageView>
    </>
  );
};

// MAPPING ========================================================================================

export default connect(
  (gs: IGlobalState) => {
    const bs = moduleConfig.getState(gs);
    return {
      session: getUserSession(gs),
      tree: bs.tree,
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
