/**
 * Schoolbook word list
 */
import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { NavigationEventSubscription, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

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
export type ISchoolbookWordListScreen_Props = ISchoolbookWordListScreen_DataProps & NavigationInjectedProps;

// COMPONENT ======================================================================================

const SchoolbookWordListScreen = (props: ISchoolbookWordListScreen_Props) => {
  const session = props.session;
  const userId = session?.user?.id;
  const userType = session?.user?.type;
  const isTeacher = userType === UserType.Teacher;
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

  const [schoolbookWords, setSchoolbookWords] = React.useState(
    isParent ? ({} as { [key: string]: IStudentAndParentWordList }) : ([] as ITeacherWordList | IStudentAndParentWordList),
  );
  const [children, setChildren] = React.useState([] as { id: string; firstName: string; unacknowledgedWordsCount: number }[]);
  const [childrenContainerWidth, setChildrenContainerWidth] = React.useState(0);
  const [selectedChildId, setSelectedChildId] = React.useState('');
  const [nextPageToFetch_state, setNextPageToFetch] = React.useState<number | { [key: string]: number }>(0);
  const [pagingSize_state, setPagingSize] = React.useState<number | undefined>(undefined);

  // Fetch children information for parent.
  const fetchParentChildren = async () => {
    try {
      const childrenByStructure = await userService.getUserChildren(userId);
      const children =
        childrenByStructure &&
        childrenByStructure[0]?.children?.map(child => ({
          id: child.id,
          firstName: child.displayName?.split(' ')[1],
        }));
      const wordsCountPromises = children?.map(child => schoolbookService.list.parentUnacknowledgedWordsCount(session, child.id));
      const childrenUnacknowledgedWordsCount = wordsCountPromises && (await Promise.all(wordsCountPromises));
      const childrenWithUnacknowledgedWordsCount = children?.map((child, index) => ({
        ...child,
        unacknowledgedWordsCount: (childrenUnacknowledgedWordsCount && childrenUnacknowledgedWordsCount[index]) || 0,
      }));
      childrenWithUnacknowledgedWordsCount && setChildren(childrenWithUnacknowledgedWordsCount);
      return childrenWithUnacknowledgedWordsCount;
    } catch (e) {
      throw e;
    }
  };

  // Fetch a page of schoolbook words.
  // Auto-increment nextPageNumber unless `fromStart` is provided.
  // If `flushAfter` is also provided along `fromStart`, all content after the loaded page will be erased.
  const fetchPage = async (fromStart?: boolean, flushAfter?: boolean, childId?: string) => {
    try {
      const studentId = isParent ? childId || selectedChildId : userId;
      const pageToFetch = fromStart ? 0 : isParent ? nextPageToFetch_state[studentId] : nextPageToFetch_state; // If page is not defined, automatically fetch the next page
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
          setSchoolbookWords(prevState => {
            return isParent
              ? {
                  ...prevState,
                  [studentId]: [
                    ...(prevState[studentId]?.slice(0, pagingSize * pageToFetch) || []),
                    ...newSchoolbookWords,
                    ...(flushAfter ? [] : prevState[studentId].slice(pagingSize * (pageToFetch + 1))),
                  ],
                }
              : [
                  ...schoolbookWords?.slice(0, pagingSize * pageToFetch),
                  ...newSchoolbookWords,
                  ...(flushAfter ? [] : schoolbookWords?.slice(pagingSize * (pageToFetch + 1))),
                ];
          });

        const nextPageToFetch = !fromStart
          ? newSchoolbookWords.length === 0 || newSchoolbookWords.length < pagingSize
            ? -1
            : pageToFetch + 1
          : flushAfter
          ? 1
          : undefined;
        nextPageToFetch &&
          setNextPageToFetch(prevState => {
            return isParent
              ? {
                  ...prevState,
                  [studentId]: nextPageToFetch,
                }
              : nextPageToFetch;
          });
        // Only increment pagecount when fromStart is not specified
        return newSchoolbookWords;
      }
    } catch (e) {
      throw e;
    }
  };

  const fetchFromStart = async () => {
    if (isParent) {
      const fetchedChildren = await fetchParentChildren();
      if (fetchedChildren?.length === 1) {
        const singleChildId = fetchedChildren[0]?.id;
        await fetchPage(true, true, singleChildId);
        setSelectedChildId(singleChildId);
      } else {
        const childrenWordListPromises = fetchedChildren?.map(fetchedChild => fetchPage(true, true, fetchedChild.id));
        const childrenWordLists =
          childrenWordListPromises && ((await Promise.all(childrenWordListPromises)) as IStudentAndParentWordList[]);
        const childIdWithNewestWord =
          fetchedChildren && childrenWordLists && getChildIdWithNewestWord(fetchedChildren, childrenWordLists);
        childIdWithNewestWord && setSelectedChildId(childIdWithNewestWord);
      }
    } else await fetchPage(true, true);
  };

  const getChildIdWithNewestWord = (
    children: { id: string; firstName: string; unacknowledgedWordsCount: number }[],
    childrenWordLists: IStudentAndParentWordList[],
  ) => {
    const newestWordDates = childrenWordLists?.map((childWordList, index) => ({
      index,
      sendingDate: childWordList && childWordList[0]?.sendingDate,
    }));
    const sortedNewestWordDates = newestWordDates?.sort((a, b) => moment(a.sendingDate).diff(b.sendingDate));
    const newestWordDate = sortedNewestWordDates && sortedNewestWordDates[sortedNewestWordDates?.length - 1];
    const childWithNewestWord = children && newestWordDate && children[newestWordDate.index];
    const childIdWithNewestWord = childWithNewestWord?.id;
    return childIdWithNewestWord;
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
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => {
            const isLastChild = index === children.length - 1;
            const isChildSelected = item.id === selectedChildId;
            return (
              <TouchableOpacity
                style={{ marginRight: isLastChild ? undefined : UI_SIZES.spacing.extraLarge }}
                onPress={() => setSelectedChildId(item.id)}>
                <TextAvatar
                  text={item.firstName}
                  textStyle={{ color: isChildSelected ? undefined : theme.greyPalette.graphite }}
                  userId={item.id}
                  badgeContent={item.unacknowledgedWordsCount}
                  badgeColor={theme.color.notificationBadge}
                  status={isChildSelected ? Status.selected : Status.disabled}
                />
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  // SCHOOLBOOK WORD LIST =========================================================================

  const renderSchoolbookWordList = () => {
    const listData = isParent ? schoolbookWords[selectedChildId] : schoolbookWords;
    const hasSeveralChildren = children?.length > 1;
    const isAllDataLoaded = isParent ? nextPageToFetch_state[selectedChildId] < 0 : nextPageToFetch_state < 0;
    return (
      <FlatList
        data={listData}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }: { item: IStudentAndParentWord | ITeacherWord }) => (
          <SummaryCard action={() => onOpenSchoolbookWord(item.id.toString())} userType={userType} userId={userId} {...item} />
        )}
        ListEmptyComponent={renderEmpty()}
        ListHeaderComponent={hasSeveralChildren ? renderChildrenList() : null}
        ListFooterComponent={loadingState === AsyncPagedLoadingState.FETCH_NEXT ? <LoadingIndicator withMargins /> : null}
        refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={() => refresh()} />}
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={() => (isAllDataLoaded ? null : fetchNextPage())}
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
  () => ({
    session: getUserSession(),
    initialLoadingState: AsyncPagedLoadingState.PRISTINE,
  }),
  dispatch => bindActionCreators({}, dispatch),
)(SchoolbookWordListScreen);
