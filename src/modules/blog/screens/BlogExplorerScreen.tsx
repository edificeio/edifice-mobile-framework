/**
 * Blog explorer
 */
import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
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
import { HeaderTitleAndSubtitle } from '~/framework/components/header';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { NamedSVGProps, PictureProps } from '~/framework/components/picture';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncLoadingState } from '~/framework/util/redux/async';
import { IUserSession, getUserSession } from '~/framework/util/session';
import { fetchBlogsAndFoldersAction } from '~/modules/blog/actions';
import moduleConfig from '~/modules/blog/moduleConfig';
import { IBlog, IBlogFlatTree, IBlogFolder, IBlogFolderWithChildren, IBlogFolderWithResources } from '~/modules/blog/reducer';
import { getBlogWorkflowInformation } from '~/modules/blog/rights';
import { formatSource } from '~/framework/util/media';

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
    (props.navigation as StackNavigationProp).push &&
      (props.navigation as StackNavigationProp).push(`${moduleConfig.routeName}`, {
        folderId: item === 'root' ? undefined : item.id,
      });
  };
  const onOpenBlog = (item: IDisplayedBlog) => {
    props.navigation.navigate(`${moduleConfig.routeName}/posts`, { selectedBlog: item });
  };

  // HEADER =====================================================================================

  const navBarInfo = ({
    resources,
    folders,
  }: {
    resources: IBlog[];
    folders: (IBlogFolderWithChildren & IBlogFolderWithResources & { depth: number })[];
  }) => {
    const currentFolderId = props.navigation.getParam('folderId');
    const currentFolder = folders.find(f => f.id === currentFolderId);
    return {
      title: currentFolder ? (
        <HeaderTitleAndSubtitle title={currentFolder.name} subtitle={I18n.t('blog.appName')} />
      ) : (
        I18n.t('blog.appName')
      ),
    };
  };

  // EMPTY SCREEN =================================================================================

  const renderEmpty = () => {
    return (
      <EmptyScreen
        svgImage="empty-search"
        title={I18n.t('blog.blogsEmptyScreen.title')}
        text={I18n.t(`blog.blogsEmptyScreen.text${hasBlogCreationRights ? '' : 'NoCreationRights'}`)}
        buttonText={hasBlogCreationRights ? I18n.t('blog.blogsEmptyScreen.button') : undefined}
        buttonUrl="/blog#/edit/new"
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
            color: (moduleConfig.displayPicture as NamedSVGProps).fill ?? theme.palette.complementary.indigo.regular,
            date: moment.max(
              b.fetchPosts?.[0]?.firstPublishDate ??
                b.fetchPosts?.[0]?.modified ??
                b.fetchPosts?.[0]?.created ??
                b.modified ??
                b.created,
              b.modified ?? b.created,
            ),
            ...(thumbnail ? { thumbnail: formatSource(thumbnail) } : { icon: 'bullhorn' }),
          };
        })
        .sort((a, b) => b.date.valueOf() - a.date.valueOf());

      const displayedFolders = finalFolders.map(f => ({
        ...f,
        color: (moduleConfig.displayPicture as NamedSVGProps).fill ?? theme.palette.complementary.indigo.regular,
      }));
      return { displayedblogs, displayedFolders };
    })();

    return (
      <Explorer
        folders={displayedFolders}
        resources={displayedblogs}
        onItemPress={onOpenItem}
        ListFooterComponent={<View style={{ paddingBottom: UI_SIZES.screen.bottomInset }} />}
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
      <PageView navigation={props.navigation} navBarWithBack={navBarInfo(props.tree || { resources: [], folders: [] })}>
        {renderPage()}
      </PageView>
    </>
  );
};

// MAPPING ========================================================================================

export default connect(
  (gs: IGlobalState) => {
    const bs = moduleConfig.getState(gs);
    return {
      session: getUserSession(),
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
