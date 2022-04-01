/**
 * Schoolbook word list
 */
import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { NavigationEventSubscription, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/AppStore';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { DEPRECATED_HeaderPrimaryAction } from '~/framework/components/header';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { computeRelativePath } from '~/framework/util/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { IUserSession, getUserSession } from '~/framework/util/session';
import { BlogPostResourceCard } from '~/modules/blog/components/BlogPostResourceCard';
import moduleConfig from '~/modules/blog/moduleConfig';
import { IBlogPost, IBlogPostList } from '~/modules/blog/reducer';
import { getBlogPostRight } from '~/modules/blog/rights';
import { blogService } from '~/modules/blog/service';

import { schoolbookService } from '../service';
import { IDisplayedBlog } from './BlogExplorerScreen';

// TYPES ==========================================================================================

export interface IBlogPostListScreen_DataProps {
  initialLoadingState: AsyncPagedLoadingState;
  session: IUserSession;
}
export interface IBlogPostListScreen_EventProps {
  doFetch: (selectedBlogId: string) => Promise<IBlogPost[] | undefined>;
}
export interface IBlogPostListScreen_NavigationParams {
  selectedBlog: IDisplayedBlog;
}
export type IBlogPostListScreen_Props = IBlogPostListScreen_DataProps &
  IBlogPostListScreen_EventProps &
  NavigationInjectedProps<IBlogPostListScreen_NavigationParams>;

// COMPONENT ======================================================================================

const SchoolbookWordListScreen = (props: IBlogPostListScreen_Props) => {
  const selectedBlog = props.navigation.getParam('selectedBlog');
  const selectedBlogId = selectedBlog && selectedBlog.id;
  const hasSchoolbookWordCreationRights = selectedBlog && getBlogPostRight(selectedBlog, props.session)?.actionRight;
  let focusEventListener: NavigationEventSubscription;

  // LOADER =====================================================================================

  // ToDo : Make this in a useLoadingState.

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  React.useEffect(() => {
    focusEventListener = props.navigation.addListener('didFocus', () => {
      if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init(selectedBlogId);
      else refreshSilent(selectedBlogId);
    });
    return () => {
      focusEventListener.remove();
    };
  }, []);

  const init = (selectedBlogId: string) => {
    if (selectedBlogId) {
      setLoadingState(AsyncPagedLoadingState.INIT);
      fetchFromStart(selectedBlogId)
        .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
        .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
    }
  };

  const reload = (selectedBlogId: string) => {
    if (selectedBlogId) {
      setLoadingState(AsyncPagedLoadingState.RETRY);
      fetchFromStart(selectedBlogId)
        .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
        .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
    }
  };

  const refresh = (selectedBlogId: string) => {
    if (selectedBlogId) {
      setLoadingState(AsyncPagedLoadingState.REFRESH);
      fetchFromStart(selectedBlogId)
        .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
        .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
    }
  };
  const refreshSilent = (selectedBlogId: string) => {
    if (selectedBlogId) {
      setLoadingState(AsyncPagedLoadingState.REFRESH_SILENT);
      fetchFromStart(selectedBlogId)
        .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
        .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
    }
  };
  const fetchNextPage = (selectedBlogId: string) => {
    if (selectedBlogId) {
      setLoadingState(AsyncPagedLoadingState.FETCH_NEXT);
      fetchPage(selectedBlogId)
        .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
        .catch(() => setLoadingState(AsyncPagedLoadingState.FETCH_NEXT_FAILED));
    }
  };

  // EVENTS =====================================================================================

  const [schoolbookWords, setSchoolbookWords] = React.useState([] as IBlogPostList);
  const [nextPageToFetch_state, setNextPageToFetch] = React.useState(0);
  const [pagingSize_state, setPagingSize] = React.useState<number | undefined>(undefined);

  // Fetch all schoolbook words in a row
  const fetchSchoolbookWords = async (blogId: string) => {
    try {
      const session = props.session;
      const newSchoolbookWords = await schoolbookService.list.teacher(session, 'Any', 0);
      setSchoolbookWords(newSchoolbookWords);
    } catch (e) {
      throw e;
    }
  };

  // Fetch a page of schoolbook words.
  // Auto-increment nextPageNumber unless `fromPage` is provided.
  // If `flushAfter` is also provided along `fromPage`, all content after the loaded page will be erased.
  const fetchPage = async (blogId: string, fromPage?: number, flushAfter?: boolean) => {
    try {
      const pageToFetch = fromPage ?? nextPageToFetch_state; // If page is not defined, automatically fetch the next page
      if (pageToFetch < 0) return; // Negatives values are used to tell end has been reached.
      const session = props.session;
      const newBlogPosts = await blogService.posts.page(session, blogId, pageToFetch, ['PUBLISHED', 'SUBMITTED']);
      let pagingSize = pagingSize_state;
      if (pagingSize === undefined) {
        setPagingSize(newBlogPosts.length);
        pagingSize = newBlogPosts.length;
      }
      if (pagingSize) {
        newBlogPosts.length &&
          setBlogPosts([
            ...blogPosts.slice(0, pagingSize * pageToFetch),
            ...newBlogPosts,
            ...(flushAfter ? [] : blogPosts.slice(pagingSize * (pageToFetch + 1))),
          ]);

        if (fromPage === undefined) {
          setNextPageToFetch(newBlogPosts.length === 0 || newBlogPosts.length < pagingSize ? -1 : pageToFetch + 1);
        } else if (flushAfter) {
          setNextPageToFetch(fromPage + 1);
        }
        // Only increment pagecount when fromPage is not specified
      }
    } catch (e) {
      throw e;
    }
  };
  const fetchFromStart = async (blogId: string) => {
    await fetchPage(blogId, 0, true);
  };

  const onGoToWordCreationScreen = () =>
    props.navigation.navigate(`${moduleConfig.routeName}/create`, {
      blog: selectedBlog,
      referrer: `${moduleConfig.routeName}/posts`,
    });

  const onOpenSchoolbookWord = (item: IBlogPost) => {
    props.navigation.navigate(computeRelativePath(`${moduleConfig.routeName}/details`, props.navigation.state), {
      schoolbookWord: item,
      // blog: selectedBlog,
    });
  };

  // HEADER =====================================================================================

  const navBarInfo = {
    title: I18n.t('schoolbook.appName'),
    //🟠 add "+" button?
  };

  // CREATE BUTTON ================================================================================

  const renderCreateButton = () => {
    const hasError =
      !selectedBlog || loadingState === AsyncPagedLoadingState.RETRY || loadingState === AsyncPagedLoadingState.INIT_FAILED;
    return hasSchoolbookWordCreationRights && !hasError ? (
      <DEPRECATED_HeaderPrimaryAction
        iconName="new_post"
        onPress={() => {
          onGoToWordCreationScreen();
        }}
      />
    ) : null;
  };

  // EMPTY SCREEN =================================================================================

  const renderEmpty = () => {
    return (
      <EmptyScreen
        svgImage="empty-schoolbook"
        title={I18n.t(
          `schoolbook.schoolbookWordListScreen.emptyScreen.title${hasSchoolbookWordCreationRights ? '' : 'NoCreationRights'}`,
        )}
        text={I18n.t(
          `schoolbook.schoolbookWordListScreen.emptyScreen.text${hasSchoolbookWordCreationRights ? '' : 'NoCreationRights'}`,
        )}
        {...(hasSchoolbookWordCreationRights
          ? {
              buttonText: I18n.t('schoolbook.schoolbookWordListScreen.emptyScreen.button'),
              buttonAction: onGoToWordCreationScreen,
            }
          : {})}
      />
    );
  };

  // ERROR ========================================================================================

  const renderError = () => {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} /*onRefresh={() => reload(selectedBlogId)}*/ />
        }>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  // BLOG POST LIST ====================================================================================

  const renderSchoolbookWordList = () => {
    return (
      <FlatList
        data={blogPosts}
        renderItem={({ item }) => {
          return (
            // <BlogPostResourceCard
            //   action={() => onOpenSchoolbookWord(item)}
            //   authorId={item.author.userId}
            //   authorName={item.author.username}
            //   comments={item.comments?.length as number}
            //   contentHtml={item.content}
            //   date={moment(item.created)}
            //   title={item.title}
            //   state={item.state as 'PUBLISHED' | 'SUBMITTED'}
            // />
            <Text>{'test'}</Text>
          );
        }}
        keyExtractor={item => item._id}
        ListEmptyComponent={renderEmpty()}
        // ListHeaderComponent={hasSchoolbookWordCreationRights ? <View style={{ height: 12 }} /> : null}
        ListFooterComponent={
          <>
            {loadingState === AsyncPagedLoadingState.FETCH_NEXT ? <LoadingIndicator withMargins /> : null}
            <View style={{ paddingBottom: UI_SIZES.screen.bottomInset }} />
          </>
        }
        // refreshControl={
        //   <RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={() => refresh(selectedBlogId)} />
        // }
        contentContainerStyle={{ flexGrow: 1 }}
        scrollIndicatorInsets={{ right: 0.001 }} // 🍎 Hack to guarantee scrollbar to be stick on the right edge of the screen.
        // onEndReached={() => {
        //   fetchNextPage(selectedBlogId);
        // }}
        onEndReachedThreshold={0.5}
      />
    );
  };

  // RENDER =======================================================================================

  const renderPage = () => {
    // if (!selectedBlog) {
    //   return renderError();
    // }
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
      case AsyncPagedLoadingState.REFRESH:
      case AsyncPagedLoadingState.REFRESH_FAILED:
      case AsyncPagedLoadingState.REFRESH_SILENT:
      case AsyncPagedLoadingState.FETCH_NEXT:
      case AsyncPagedLoadingState.FETCH_NEXT_FAILED:
        return renderSchoolbookWordList();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <LoadingIndicator />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  return (
    <>
      <PageView navigation={props.navigation} navBarWithBack={navBarInfo} /*navBarNode={renderCreateButton()}*/>
        {renderPage()}
      </PageView>
    </>
  );
};

// MAPPING ========================================================================================

export default connect(
  (gs: IGlobalState) => {
    return {
      session: getUserSession(gs),
      initialLoadingState: AsyncPagedLoadingState.PRISTINE,
    };
  },
  dispatch => bindActionCreators({}, dispatch),
)(SchoolbookWordListScreen);

//   <SummaryCard
//     // action={() => console.log('open schoolbook word')} //🟠 arrive on details page
//     // id={8} //🟠 use as index and not prop
//     userType={"Teacher"}
//     acknowledgments={[]}
//     parentId={'1234'}
//     owner={'a5aa622a-591b-4c14-aca3-fc77bffd1098'}
//     ownerName={'Gaspard'}
//     ackNumber={0}
//     category={'leisure'}
//     respNumber={8}
//     sendingDate={moment()}
//     text={
//       '<div>hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello</div>'
//     }
//     title={
//       'Mot du carnet de liaison Mot du carnet de liaison Mot du carnet de liaison Mot du carnet de liaison Mot du carnet de liaison'
//     }
//     total={1}
//     recipients={[
//       { userId: 'a5aa622a-591b-4c14-aca3-fc77bffd1098', displayName: 'Joe Z' },
//       { userId: 'b144e768-128f-443f-af46-b62c7c29ac3d', displayName: 'Wayne S' },
//       { userId: 'a5aa622a-591b-4c14-aca3-fc77bffd1098', displayName: 'Herbie H' },
//       { userId: 'b144e768-128f-443f-af46-b62c7c29ac3d', displayName: 'Bobbi H' },
//     ]}
//   />
