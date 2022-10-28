/**
 * Schoolbook word details
 */
import I18n from 'i18n-js';
import React from 'react';
import { Alert, Platform, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { NavigationActions, NavigationEventSubscription, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ActionsMenu from '~/framework/components/actionsMenu';
import { UI_ANIMATIONS } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { HeaderIcon } from '~/framework/components/header';
import { LoadingIndicator } from '~/framework/components/loading';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import { computeRelativePath } from '~/framework/util/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { IUserSession, UserType, getUserSession } from '~/framework/util/session';
import SchoolbookWordDetailsCard from '~/modules/schoolbook/components/SchoolbookWordDetailsCard';
import moduleConfig from '~/modules/schoolbook/moduleConfig';
import { IWordReport } from '~/modules/schoolbook/reducer';
import { hasDeleteRight } from '~/modules/schoolbook/rights';
import { schoolbookService, schoolbookUriCaptureFunction } from '~/modules/schoolbook/service';

// TYPES ==========================================================================================

export interface ISchoolbookWordDetailsScreen_DataProps {
  initialLoadingState: AsyncPagedLoadingState;
  session: IUserSession;
}
export type ISchoolbookWordDetailsScreen_Props = ISchoolbookWordDetailsScreen_DataProps & NavigationInjectedProps;

// COMPONENT ======================================================================================

const SchoolbookWordDetailsScreen = (props: ISchoolbookWordDetailsScreen_Props) => {
  const detailsCardRef: { current: any } = React.useRef();
  const session = props.session;
  const userId = session?.user?.id;
  const userType = session?.user?.type;
  const isTeacher = userType === UserType.Teacher;
  const isParent = userType === UserType.Relative;
  const menuData = [
    {
      text: I18n.t('common.delete'),
      icon: 'trash',
      onPress: () => showDeleteSchoolbookWordAlert(),
    },
  ];

  // LOADER =====================================================================================

  // ToDo : Make this in a useLoadingState.

  const [schoolbookWordId, setSchoolbookWordId] = React.useState('');
  const [studentId, setStudentId] = React.useState('');
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const [isPublishingReply, setIsPublishingReply] = React.useState(false);
  const [isAcknowledgingWord, setIsAcknowledgingWord] = React.useState(false);
  const isSchoolbookWordRendered =
    loadingState === AsyncPagedLoadingState.DONE ||
    loadingState === AsyncPagedLoadingState.REFRESH_SILENT ||
    loadingState === AsyncPagedLoadingState.REFRESH_FAILED;
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    getSchoolbookWordIds()
      .then(schoolbookWordId => fetchSchoolbookWord(schoolbookWordId))
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    getSchoolbookWordIds()
      .then(schoolbookWordId => fetchSchoolbookWord(schoolbookWordId))
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const refreshSilent = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH_SILENT);
    return getSchoolbookWordIds()
      .then(schoolbookWordId => fetchSchoolbookWord(schoolbookWordId))
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
  };

  const fetchOnNavigation = () => {
    if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
    else refreshSilent();
  };

  const focusEventListener = React.useRef<NavigationEventSubscription>();
  React.useEffect(() => {
    focusEventListener.current = props.navigation.addListener('didFocus', () => {
      fetchOnNavigation();
    });
    return () => {
      focusEventListener.current?.remove();
    };
  }, []);

  // EVENTS =====================================================================================

  const [schoolbookWord, setSchoolbookWord] = React.useState({} as IWordReport);

  const getSchoolbookWordIds = async () => {
    const notification = props.navigation.getParam('notification');
    let ids;
    if (notification) {
      const resourceUri = notification?.resource?.uri;
      if (!resourceUri) {
        throw new Error('failed to call api (resourceUri is undefined)');
      }
      ids = schoolbookUriCaptureFunction(resourceUri) as Required<ReturnType<typeof schoolbookUriCaptureFunction>>;
      if (!ids.schoolbookWordId) {
        throw new Error(`failed to capture resourceUri "${resourceUri}": ${ids}`);
      }
    } else {
      const schoolbookWordId = props.navigation.getParam('schoolbookWordId');
      const studentId = props.navigation.getParam('studentId');
      if (!schoolbookWordId || (isParent && !studentId)) {
        throw new Error(`missing schoolbookWordId or studentId : ${{ schoolbookWordId, studentId }}`);
      }
      ids = { schoolbookWordId, studentId };
    }
    setSchoolbookWordId(ids.schoolbookWordId);
    isParent && setStudentId(ids.studentId);
    return ids.schoolbookWordId;
  };

  const fetchSchoolbookWord = async schoolbookWordId => {
    try {
      const schoolbookWord = await schoolbookService.word.get(session, schoolbookWordId);
      setSchoolbookWord(schoolbookWord);
    } catch (e) {
      throw e;
    }
  };

  const acknowledgeSchoolbookWord = async () => {
    try {
      setIsAcknowledgingWord(true);
      await schoolbookService.word.acknowledge(session, schoolbookWordId, studentId);
      refreshSilent();
    } catch (e) {
      setIsAcknowledgingWord(false);
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  const replyToSchoolbookWord = async (comment: string, commentId?: string) => {
    try {
      setIsPublishingReply(true);
      if (commentId) {
        await schoolbookService.word.updateReply(session, schoolbookWordId, commentId, comment);
        detailsCardRef?.current?.cardSelectedCommentFieldRef()?.setIsEditingFalse();
      } else {
        await schoolbookService.word.reply(session, schoolbookWordId, studentId, comment);
      }
      await refreshSilent();
      if (!commentId) {
        // Note #1: setTimeout is used to wait for the ScrollView height to update (after a response is added).
        // Note #2: scrollToEnd seems to become less precise once there is lots of data.
        setTimeout(() => detailsCardRef?.current?.scrollToEnd(), 1000);
      }
    } catch (e) {
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    } finally {
      setIsPublishingReply(false);
    }
  };

  const deleteSchoolbookWord = async () => {
    try {
      await schoolbookService.word.delete(session, schoolbookWordId);
      props.navigation.goBack();
    } catch (e) {
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  const showDeleteSchoolbookWordAlert = () =>
    Alert.alert(
      I18n.t('schoolbook.schoolbookWordDetailsScreen.deleteAlert.title'),
      I18n.t('schoolbook.schoolbookWordDetailsScreen.deleteAlert.text'),
      [
        {
          text: I18n.t('common.cancel'),
          style: 'default',
        },
        {
          text: I18n.t('common.delete'),
          style: 'destructive',
          onPress: () => deleteSchoolbookWord(),
        },
      ],
    );

  const openSchoolbookWordReport = () =>
    props.navigation.navigate(computeRelativePath(`${moduleConfig.routeName}/report`, props.navigation.state), {
      schoolbookWordId,
    });

  // HEADER =====================================================================================

  const [showMenu, setShowMenu] = React.useState(false);
  const schoolbookWordOwnerId = schoolbookWord?.word?.ownerId;
  const isUserSchoolbookWordOwner = userId === schoolbookWordOwnerId;
  const schoolbookWordResource = { shared: schoolbookWord?.word?.shared, author: { userId: schoolbookWord?.word?.ownerId } };
  const hasSchoolbookWordDeleteRights = hasDeleteRight(schoolbookWordResource, session);
  const canDeleteSchoolbookWord = isUserSchoolbookWordOwner || hasSchoolbookWordDeleteRights;
  const navBarInfo = {
    title: I18n.t('schoolbook.appName'),
    right:
      isSchoolbookWordRendered && canDeleteSchoolbookWord ? (
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
          <HeaderIcon name="more_vert" iconSize={24} />
        </TouchableOpacity>
      ) : undefined,
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

  // SCHOOLBOOK WORD DETAILS =========================================================================

  const renderSchoolbookWordDetails = () => {
    return (
      <SchoolbookWordDetailsCard
        ref={detailsCardRef}
        action={() => (isTeacher ? openSchoolbookWordReport() : isParent ? acknowledgeSchoolbookWord() : undefined)}
        userType={userType}
        userId={userId}
        studentId={studentId}
        schoolbookWord={schoolbookWord}
        isPublishingReply={isPublishingReply}
        isAcknowledgingWord={isAcknowledgingWord}
        onPublishReply={(comment, commentId) => replyToSchoolbookWord(comment, commentId)}
      />
    );
  };

  // RENDER =======================================================================================

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
      case AsyncPagedLoadingState.REFRESH_SILENT:
      case AsyncPagedLoadingState.REFRESH_FAILED:
        return renderSchoolbookWordDetails();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <LoadingIndicator />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  const PageComponent = Platform.select({ ios: KeyboardPageView, android: PageView })!;

  return (
    <>
      <PageComponent
        safeArea={false}
        navigation={props.navigation}
        navBarWithBack={navBarInfo}
        onBack={() => {
          detailsCardRef?.current?.cardBottomEditorSheetRef()?.doesCommentExist()
            ? detailsCardRef?.current
                ?.cardBottomEditorSheetRef()
                ?.confirmDiscard(() => props.navigation.dispatch(NavigationActions.back()))
            : detailsCardRef?.current?.cardSelectedCommentFieldRef()?.doesCommentExist() &&
              !detailsCardRef?.current?.cardSelectedCommentFieldRef()?.isCommentUnchanged()
            ? detailsCardRef?.current
                ?.cardSelectedCommentFieldRef()
                ?.confirmDiscard(() => props.navigation.dispatch(NavigationActions.back()))
            : props.navigation.dispatch(NavigationActions.back());
        }}>
        {renderPage()}
      </PageComponent>
      <ActionsMenu onClickOutside={() => setShowMenu(!showMenu)} show={showMenu} data={menuData} />
    </>
  );
};

// MAPPING ========================================================================================

export default connect(
  () => ({
    session: getUserSession(),
    initialLoadingState: AsyncPagedLoadingState.PRISTINE,
  }),
  dispatch => bindActionCreators({}, dispatch),
)(SchoolbookWordDetailsScreen);
