/**
 * Blog post list
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
import { signURISource, transformedSrc } from '~/infra/oauth';
import { Drawer } from '~/framework/components/drawer';
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

import { fetchBlogsAndFoldersAction } from '../actions';
import moduleConfig from '../moduleConfig';
import { IBlog, IBlogFolder, IBlogFolderWithChildren, IBlogFolderWithResources, IBlogFlatTree } from '../reducer';
import { getBlogWorkflowInformation } from '../rights';
import { IDisplayedBlog } from './BlogExplorerScreen';

// TYPES ==========================================================================================

export interface IBlogPostListScreen_DataProps {
  // tree?: IBlogFlatTree;
  // initialLoadingState: AsyncLoadingState;
  // error?: Error;
  session: IUserSession;
}
export interface IBlogPostListScreen_EventProps {
  // doFetch: () => Promise<[IBlog[], IBlogFolder[]] | undefined>;
}
export interface IBlogPostListScreen_NavigationParams {
  // folderId?: string;
  // filter?: 'trash' | 'public' | 'sharedWithMe';
  selectedBlog: IDisplayedBlog;
}
export type IBlogPostListScreen_Props = IBlogPostListScreen_DataProps &
  IBlogPostListScreen_EventProps &
  NavigationInjectedProps<IBlogPostListScreen_NavigationParams>;

// COMPONENT ======================================================================================

const BlogPostListScreen = (props: IBlogPostListScreen_Props) => {
  const insets = useSafeAreaInsets();
  const hasBlogCreationRights = getBlogWorkflowInformation(props.session) && getBlogWorkflowInformation(props.session).blog.create;
  const selectedBlog = props.navigation.getParam('selectedBlog');
  const selectedBlogTitle = selectedBlog && selectedBlog.title;

  // LOADER =====================================================================================

  // ToDo : Make this in a useLoadingState.

  // const [loadingState, setLoadingState] = React.useState(props.initialLoadingState);
  // console.log('loadingState', loadingState);

  // React.useEffect(() => {
  //   // console.log("user effect ?", loadingState);
  //   if (loadingState === AsyncLoadingState.PRISTINE) {
  //     setLoadingState(AsyncLoadingState.INIT);
  //     props
  //       .doFetch()
  //       .then(() => setLoadingState(AsyncLoadingState.DONE))
  //       .catch(() => setLoadingState(AsyncLoadingState.INIT_FAILED));
  //   }
  // }, []);

  // const reload = () => {
  //   setLoadingState(AsyncLoadingState.RETRY);
  //   props
  //     .doFetch()
  //     .then(() => setLoadingState(AsyncLoadingState.DONE))
  //     .catch(() => setLoadingState(AsyncLoadingState.INIT_FAILED));
  // };

  // const refresh = () => {
  //   setLoadingState(AsyncLoadingState.REFRESH);
  //   props
  //     .doFetch()
  //     .then(() => setLoadingState(AsyncLoadingState.DONE))
  //     .catch(() => setLoadingState(AsyncLoadingState.REFRESH_FAILED));
  // };

  // EVENTS =====================================================================================

  const onGoToPostCreationScreen = () => props.navigation.navigate(`${moduleConfig.routeName}/create`, { blog: selectedBlog });

  // const onOpenItem = (
  //   item:
  //     | (IExplorerFolderItem & IBlogFolder)
  //     | (IExplorerResourceItemWithImage & IDisplayedBlog)
  //     | (IExplorerResourceItemWithIcon & IDisplayedBlog),
  // ) => {
  //   // console.log("onOpenItem", item);
  //   if (item.type === 'folder') {
  //     onOpenFolder(item);
  //   } else if (item.type === 'resource') {
  //     onOpenBlog(item);
  //   } else {
  //     // No-op
  //   }
  // };
  // const onOpenFolder = (item: IBlogFolder | 'root') => {
  //   props.navigation.setParams({ folderId: item === 'root' ? undefined : item.id });
  // };
  // const onOpenBlog = (item: IDisplayedBlog) => {
  //   props.navigation.navigate(`${moduleConfig.routeName}/posts`, { selectedBlog: item });
  // };

  // HEADER =====================================================================================

  const header = (
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
          {selectedBlogTitle ? (
            <>
              <HeaderTitle>{selectedBlogTitle}</HeaderTitle>
              <HeaderSubtitle>{I18n.t('blog.appName')}</HeaderSubtitle>
            </>
          ) : (
            <HeaderTitle>{I18n.t('blog.appName')}</HeaderTitle>
          )}
        </HeaderCenter>
      </HeaderRow>
    </FakeHeader>
  );

  // EMPTY SCREEN =================================================================================

  const renderEmpty = () => {
    return (
      <EmptyScreen
        imageSrc={require('ASSETS/images/empty-screen/blog.png')}
        imgWidth={265.98}
        imgHeight={279.97}
        customStyle={{ backgroundColor: theme.color.background.card }}
        title={I18n.t(`blog.blogPostListScreen.emptyScreen.title${hasBlogCreationRights ? '' : 'NoCreationRights'}`)}
        text={I18n.t(`blog.blogPostListScreen.emptyScreen.text${hasBlogCreationRights ? '' : 'NoCreationRights'}`)}
        buttonText={hasBlogCreationRights ? I18n.t('blog.blogPostListScreen.emptyScreen.button') : undefined}
        buttonAction={() => onGoToPostCreationScreen()}
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

  // DRAWER =======================================================================================

  // const renderDrawer = (
  //   flatHierarchy: ({
  //     depth: number;
  //   } & IBlogFolderWithChildren)[],
  // ) => {
  //   return (
  //     <View style={{ marginBottom: 45, zIndex: 1 }}>
  //       <Drawer
  //         items={[
  //           {
  //             name: I18n.t('blog.blogExplorerScreen.rootItemName'),
  //             value: 'root',
  //             iconName: 'folder1',
  //             depth: 0,
  //           },
  //           ...(flatHierarchy || []).map(f => ({
  //             name: f.name,
  //             value: f.id,
  //             iconName: 'folder1',
  //             depth: f.depth + 1,
  //           })),
  //         ]}
  //         selectItem={item => {
  //           if (item === 'root') onOpenFolder(item);
  //           else {
  //             const folder = props.tree?.folders.find(f => f.id === item);
  //             folder && onOpenFolder(folder);
  //           }
  //         }}
  //         selectedItem={props.navigation.getParam('folderId') ?? 'root'}
  //       />
  //     </View>
  //   );
  // };

  // EXPLORER ====================================================================================

  // const renderExplorer = ({
  //   resources,
  //   folders,
  // }: {
  //   resources: IBlog[];
  //   folders: (IBlogFolderWithChildren & IBlogFolderWithResources & { depth: number })[];
  // }) => {
  //   const currentFolderId = props.navigation.getParam('folderId');
  //   const currentFolder = folders.find(f => f.id === currentFolderId);
  //   if (currentFolderId && !currentFolder) {
  //     return <EmptyContentScreen />;
  //   }
  //   const finalFolders = currentFolder ? currentFolder!.children || [] : folders.filter(f => f.depth === 0);
  //   const finalBlogs = currentFolder ? currentFolder!.resources || [] : resources;

  //   // Format data

  //   const { displayedblogs, displayedFolders } = (() => {
  //     const displayedblogs = finalBlogs
  //       .map(bb => {
  //         const { thumbnail, ...b } = bb;
  //         return {
  //           ...b,
  //           color: theme.themeOpenEnt.indigo,
  //           date: moment.max(
  //             b.fetchPosts?.[0]?.firstPublishDate ??
  //               b.fetchPosts?.[0]?.modified ??
  //               b.fetchPosts?.[0]?.created ??
  //               b.modified ??
  //               b.created,
  //             b.modified ?? b.created,
  //           ),
  //           ...(thumbnail ? { thumbnail: signURISource(transformedSrc(thumbnail)) } : { icon: 'bullhorn' }),
  //         };
  //       })
  //       .sort((a, b) => b.date.valueOf() - a.date.valueOf());

  //     const displayedFolders = finalFolders.map(f => ({ ...f, color: theme.themeOpenEnt.indigo }));
  //     return { displayedblogs, displayedFolders };
  //   })();

  //   return (
  //     <Explorer
  //       folders={displayedFolders}
  //       resources={displayedblogs}
  //       onItemPress={onOpenItem}
  //       ListFooterComponent={<View style={{ marginBottom: insets.bottom }} />}
  //       refreshControl={<RefreshControl refreshing={loadingState === AsyncLoadingState.REFRESH} onRefresh={() => refresh()} />}
  //       ListEmptyComponent={renderEmpty()}
  //       contentContainerStyle={{ flexGrow: 1 }}
  //       keyExtractor={item => item.id}
  //     />
  //   );
  // };

  // RENDER =======================================================================================

  const renderPage = () => {
    return renderEmpty();
    // if (!selectedBlog) {
    //   return renderError();
    // }
    // switch (loadingState) {
    //   case AsyncLoadingState.DONE:
    //   case AsyncLoadingState.REFRESH:
    //   case AsyncLoadingState.REFRESH_FAILED:
    //     return (
    //       <>
    //         {renderDrawer(props.tree?.folders || [])}
    //         {renderExplorer(props.tree || { resources: [], folders: [] })}
    //       </>
    //     );

    //   case AsyncLoadingState.PRISTINE:
    //   case AsyncLoadingState.INIT:
    //     return <LoadingIndicator />;

    //   case AsyncLoadingState.INIT_FAILED:
    //   case AsyncLoadingState.RETRY:
    //     return renderError();
    // }
  };

  return (
    <>
      {header}
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
      // tree: bs.tree,
      // initialLoadingState: bs.folders.isPristine || bs.blogs.isPristine ? AsyncLoadingState.PRISTINE : AsyncLoadingState.DONE,
      // error: bs.blogs.error ?? bs.folders.error,
    };
  },
  dispatch =>
    bindActionCreators(
      {
        // doFetch: tryAction(fetchBlogsAndFoldersAction, undefined, true) as any, // FUCK OFF REACT-REDUX YOUR TYPES DEFINITIONS SUCKS
      },
      dispatch,
    ),
)(BlogPostListScreen);
