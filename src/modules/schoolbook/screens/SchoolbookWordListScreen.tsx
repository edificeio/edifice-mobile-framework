/**
 * Schoolbook word list
 */
import I18n from 'i18n-js';
import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { NavigationEventSubscription, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/AppStore';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import FlatList from '~/framework/components/flatList';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { computeRelativePath } from '~/framework/util/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { IUserSession, UserType, getUserSession } from '~/framework/util/session';
import { SummaryCard } from '~/modules/schoolbook/components/SummaryCard';
import moduleConfig from '~/modules/schoolbook/moduleConfig';
import { userService } from '~/user/service';

import { IStudentAndParentWord, IStudentAndParentWordList, ITeacherWord, ITeacherWordList } from '../reducer';
import { schoolbookService } from '../service';

// TYPES ==========================================================================================

export interface ISchoolbookWordListScreen_DataProps {
  initialLoadingState: AsyncPagedLoadingState;
  session: IUserSession;
}
export interface ISchoolbookWordListScreen_EventProps {
  doFetch: () => Promise<ITeacherWordList | IStudentAndParentWordList | undefined>;
}
export type ISchoolbookWordListScreen_Props = ISchoolbookWordListScreen_DataProps &
  ISchoolbookWordListScreen_EventProps &
  NavigationInjectedProps;

// COMPONENT ======================================================================================

const SchoolbookWordListScreen = (props: ISchoolbookWordListScreen_Props) => {
  const session = props.session;
  const userId = session?.user?.id;
  const userType = session?.user?.type;
  const isTeacher = userType === UserType.Teacher;
  const isStudent = userType === UserType.Student;
  const isParent = userType === UserType.Relative;
  const hasSchoolbookWordCreationRights = true; //⚪️ handle (example: selectedBlog && getBlogPostRight(selectedBlog, session)?.actionRight;)
  let focusEventListener: NavigationEventSubscription;

  // LOADER =====================================================================================

  // ToDo : Make this in a useLoadingState.

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  React.useEffect(() => {
    focusEventListener = props.navigation.addListener('didFocus', () => {
      if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
      else refreshSilent();
    });
    return () => {
      focusEventListener.remove();
    };
  }, []);

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    fetchFromStart()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    fetchFromStart()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const refresh = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH);
    fetchFromStart()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
  };
  const refreshSilent = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH_SILENT);
    fetchFromStart()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
  };
  const fetchNextPage = () => {
    setLoadingState(AsyncPagedLoadingState.FETCH_NEXT);
    fetchPage()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.FETCH_NEXT_FAILED));
  };

  // EVENTS =====================================================================================

  const [schoolbookWords, setSchoolbookWords] = React.useState([] as ITeacherWordList | IStudentAndParentWordList);
  const [parentChildren, setParentChildren] = React.useState([] as any); //⚪️type
  const [nextPageToFetch_state, setNextPageToFetch] = React.useState(0);
  const [pagingSize_state, setPagingSize] = React.useState<number | undefined>(undefined);

  // Fetch all children for a parent
  const fetchParentChildren = async () => {
    //⚪️use
    try {
      const parentChildren = await userService.getUserChildren(userId);
      setParentChildren(parentChildren);
    } catch (e) {
      throw e;
    }
  };

  // Fetch a page of schoolbook words.
  // Auto-increment nextPageNumber unless `fromPage` is provided.
  // If `flushAfter` is also provided along `fromPage`, all content after the loaded page will be erased.
  const fetchPage = async (fromPage?: number, flushAfter?: boolean) => {
    try {
      const studentId = isStudent ? userId : 'selectedChildId'; //⚪️variable for parent
      const pageToFetch = fromPage ?? nextPageToFetch_state; // If page is not defined, automatically fetch the next page
      if (pageToFetch < 0) return; // Negatives values are used to tell end has been reached.
      const newSchoolbookWords = isTeacher
        ? await schoolbookService.list.teacher(session, pageToFetch)
        : await schoolbookService.list.studentAndParent(session, pageToFetch, studentId);
      let pagingSize = pagingSize_state;
      if (pagingSize === undefined) {
        setPagingSize(newSchoolbookWords.length);
        pagingSize = newSchoolbookWords.length;
      }
      if (pagingSize) {
        //⚪️type
        newSchoolbookWords.length &&
          setSchoolbookWords([
            ...schoolbookWords.slice(0, pagingSize * pageToFetch),
            ...newSchoolbookWords,
            ...(flushAfter ? [] : schoolbookWords.slice(pagingSize * (pageToFetch + 1))),
          ]);

        if (fromPage === undefined) {
          setNextPageToFetch(newSchoolbookWords.length === 0 || newSchoolbookWords.length < pagingSize ? -1 : pageToFetch + 1);
        } else if (flushAfter) {
          setNextPageToFetch(fromPage + 1);
        }
        // Only increment pagecount when fromPage is not specified
      }
    } catch (e) {
      throw e;
    }
  };
  const fetchFromStart = async () => {
    await fetchPage(0, true);
  };

  const onGoToWordCreationWebpage = () => console.log('⚪️ go to web');

  const onOpenSchoolbookWord = (item: ITeacherWord | IStudentAndParentWord) => {
    props.navigation.navigate(computeRelativePath(`${moduleConfig.routeName}/details`, props.navigation.state), {
      schoolbookWord: item, //⚪️keep?
    });
  };

  // HEADER =====================================================================================

  const navBarInfo = {
    title: I18n.t('schoolbook.appName'),
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
              buttonAction: onGoToWordCreationWebpage,
            }
          : {})}
      />
    );
  };

  // ERROR ========================================================================================

  const renderError = () => {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={() => reload()} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  // SCHOOLBOOK WORD LIST ====================================================================================

  const renderSchoolbookWordList = () => {
    return (
      <FlatList
        data={schoolbookWords}
        renderItem={({ item }) => {
          return (
            // ⚪️ types + transfer item directly(?)
            <SummaryCard
              action={() => onOpenSchoolbookWord(item)}
              userType={userType}
              userId={userId}
              acknowledgments={item.acknowledgments}
              owner={item.owner}
              ownerName={item.ownerName}
              responses={item.responses}
              ackNumber={item.ackNumber}
              category={item.category}
              recipients={
                //⚪️ wait backend change (replace with "item.recipients")
                userType === UserType.Teacher
                  ? [
                      { userId: 'b144e768-128f-443f-af46-b62c7c29ac3d', displayName: 'Joe Z' },
                      { userId: 'b144e768-128f-443f-af46-b62c7c29ac3d', displayName: 'Herbie H' },
                    ]
                  : undefined
              }
              respNumber={item.respNumber}
              sendingDate={item.sendingDate}
              text={item.text}
              title={item.title}
              total={item.total}
            />
          );
        }}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmpty()}
        ListFooterComponent={loadingState === AsyncPagedLoadingState.FETCH_NEXT ? <LoadingIndicator withMargins /> : null}
        refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={() => refresh()} />}
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={() => fetchNextPage()}
        onEndReachedThreshold={0.5}
      />
    );
  };

  // RENDER =======================================================================================

  const renderPage = () => {
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
    <PageView navigation={props.navigation} navBarWithBack={navBarInfo}>
      {renderPage()}
    </PageView>
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
