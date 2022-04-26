/**
 * Schoolbook word list
 */
import I18n from 'i18n-js';
import React from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { NavigationEventSubscription, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import FlatList from '~/framework/components/flatList';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { TextAvatar } from '~/framework/components/textAvatar';
import { computeRelativePath } from '~/framework/util/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { IUserSession, UserType, getUserSession } from '~/framework/util/session';
import { SummaryCard } from '~/modules/schoolbook/components/SummaryCard';
import moduleConfig from '~/modules/schoolbook/moduleConfig';
import { Status } from '~/ui/avatars/Avatar';
import { userService } from '~/user/service';

import { IStudentAndParentWord, IStudentAndParentWordList, ITeacherWord, ITeacherWordList } from '../reducer';
import { getSchoolbookWorkflowInformation } from '../rights';
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
  const hasSchoolbookWordCreationRights = getSchoolbookWorkflowInformation(session).create;
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
  const [children, setChildren] = React.useState([] as { id: string; firstName: string }[]);
  const [selectedChildId, setSelectedChildId] = React.useState('');
  const [nextPageToFetch_state, setNextPageToFetch] = React.useState(0);
  const [pagingSize_state, setPagingSize] = React.useState<number | undefined>(undefined);
  const [childrenContainerWidth, setChildrenContainerWidth] = React.useState(0);

  // Fetch all children for a parent.
  const fetchParentChildren = async () => {
    try {
      const parentChildren = await userService.getUserChildren(userId);
      const children =
        parentChildren &&
        parentChildren[0]?.children?.map(child => ({
          id: child.id,
          firstName: child.displayName?.split(' ')[1],
        }));
      const selectedChildId = children && children.length > 1 ? children[0].id : children && children[0].id;
      children && setChildren(children);
      selectedChildId && setSelectedChildId(selectedChildId);
      return selectedChildId;
    } catch (e) {
      throw e;
    }
  };

  // Fetch a page of schoolbook words.
  // Auto-increment nextPageNumber unless `fromPage` is provided.
  // If `flushAfter` is also provided along `fromPage`, all content after the loaded page will be erased.
  const fetchPage = async (fromPage?: number, flushAfter?: boolean, selectedChildId?: string) => {
    try {
      const pageToFetch = fromPage ?? nextPageToFetch_state; // If page is not defined, automatically fetch the next page
      if (pageToFetch < 0) return; // Negatives values are used to tell end has been reached.
      const studentId = isStudent ? userId : selectedChildId;
      const newSchoolbookWords = isTeacher
        ? await schoolbookService.list.teacher(session, pageToFetch)
        : await schoolbookService.list.studentAndParent(session, pageToFetch, studentId);
      let pagingSize = pagingSize_state;
      if (pagingSize === undefined) {
        setPagingSize(newSchoolbookWords.length);
        pagingSize = newSchoolbookWords.length;
      }
      if (pagingSize) {
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
  const fetchFromStart = async (childId?: string) => {
    const selectedChildId =
      childId || (isParent && loadingRef.current === AsyncPagedLoadingState.PRISTINE && (await fetchParentChildren()));
    await fetchPage(0, true, selectedChildId);
  };

  const onOpenSchoolbookWord = (item: ITeacherWord | IStudentAndParentWord) => {
    props.navigation.navigate(computeRelativePath(`${moduleConfig.routeName}/details`, props.navigation.state), {
      schoolbookWord: item,
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
              buttonUrl: '/schoolbook#/list',
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

  // CHILDREN LIST ================================================================================

  const renderChildrenList = () => {
    const doChildrenSurpassScreen = childrenContainerWidth > UI_SIZES.screen.width;
    return (
      <View>
        <FlatList
          horizontal
          scrollEnabled={doChildrenSurpassScreen}
          onContentSizeChange={contentWidth => setChildrenContainerWidth(contentWidth)}
          contentContainerStyle={{
            paddingHorizontal: UI_SIZES.spacing.extraLarge,
            paddingVertical: UI_SIZES.spacing.large,
          }}
          data={children}
          renderItem={({ item, index }) => {
            const isLastChild = index === children.length - 1;
            const isChildSelected = item.id === selectedChildId;
            return (
              <TouchableOpacity
                style={{
                  marginRight: isLastChild ? undefined : UI_SIZES.spacing.extraLarge,
                }}
                onPress={() => {
                  setSelectedChildId(item.id);
                  fetchFromStart(item.id);
                }}>
                <TextAvatar
                  text={item.firstName}
                  textStyle={{ color: isChildSelected ? undefined : theme.greyPalette.graphite }}
                  userId={item.id}
                  badgeContent={0}
                  badgeColor={theme.color.notificationBadge}
                  status={isChildSelected ? Status.selected : Status.disabled}
                />
              </TouchableOpacity>
            );
          }}
          keyExtractor={item => item.id}
        />
      </View>
    );
  };

  // SCHOOLBOOK WORD LIST =========================================================================

  const renderSchoolbookWordList = () => {
    return (
      <FlatList
        data={schoolbookWords}
        renderItem={({ item }) => {
          return (
            <SummaryCard action={() => onOpenSchoolbookWord(item.id.toString())} userType={userType} userId={userId} {...item} />
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

  // CONTENT ======================================================================================

  const renderContent = () => {
    return (
      <>
        {children?.length > 1 ? renderChildrenList() : null}
        {renderSchoolbookWordList()}
      </>
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
        return renderContent();
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
