/**
 * Schoolbook word details
 */
import { CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import React from 'react';
import { Alert, Platform, RefreshControl, ScrollView } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { NavigationEventSubscription } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { UI_ANIMATIONS } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { HeaderIcon } from '~/framework/components/header';
import { LoadingIndicator } from '~/framework/components/loading';
import { deleteAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import { ISession } from '~/framework/modules/auth/model';
import { assertSession } from '~/framework/modules/auth/reducer';
import SchoolbookWordDetailsCard from '~/framework/modules/schoolbook/components/SchoolbookWordDetailsCard';
import moduleConfig from '~/framework/modules/schoolbook/module-config';
import { IWordReport } from '~/framework/modules/schoolbook/reducer';
import { hasDeleteRight } from '~/framework/modules/schoolbook/rights';
import { schoolbookService, schoolbookUriCaptureFunction } from '~/framework/modules/schoolbook/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import { computeRelativePath } from '~/framework/util/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { UserType } from '~/framework/util/session';
import { ISchoolbookNotification } from '~/modules/schoolbook/notifHandler';

import { SchoolbookNavigationParams, schoolbookRouteNames } from '../navigation';

// TYPES ==========================================================================================

export interface SchoolbookWordDetailsScreenDataProps {
  initialLoadingState: AsyncPagedLoadingState;
  session: ISession;
}
export interface SchoolbookWordDetailsScreenNavigationParams {
  notification: ISchoolbookNotification;
  schoolbookWordId: string;
  studentId: string;
}
export type SchoolbookWordDetailsScreenProps = SchoolbookWordDetailsScreenDataProps &
  NativeStackScreenProps<SchoolbookNavigationParams, typeof schoolbookRouteNames.details>;

// HEADER =====================================================================================

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<SchoolbookNavigationParams, typeof schoolbookRouteNames.details>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('schoolbook.appName'),
  headerRight: undefined,
});

// COMPONENT ======================================================================================

const SchoolbookWordDetailsScreen = (props: SchoolbookWordDetailsScreenProps) => {
  const detailsCardRef: { current: any } = React.useRef();
  const session = props.session;
  const userId = session?.user?.id;
  const userType = session?.user?.type;
  const isTeacher = userType === UserType.Teacher;
  const isParent = userType === UserType.Relative;

  // LOADER =====================================================================================

  // ToDo : Make this in a useLoadingState or <ContentLoader/>.

  const [schoolbookWordId, setSchoolbookWordId] = React.useState('');
  const [schoolbookWord, setSchoolbookWord] = React.useState({} as IWordReport);
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
    const schoolbookWordOwnerId = schoolbookWord?.word?.ownerId;
    const isUserSchoolbookWordOwner = userId === schoolbookWordOwnerId;
    const schoolbookWordResource = { shared: schoolbookWord?.word?.shared, author: { userId: schoolbookWord?.word?.ownerId } };
    const hasSchoolbookWordDeleteRights = hasDeleteRight(schoolbookWordResource, session);
    const canDeleteSchoolbookWord = isUserSchoolbookWordOwner || hasSchoolbookWordDeleteRights;
    props.navigation.setOptions({
      headerRight: () =>
        isSchoolbookWordRendered && canDeleteSchoolbookWord ? (
          <PopupMenu actions={[deleteAction({ action: () => showDeleteSchoolbookWordAlert() })]}>
            <HeaderIcon name="more_vert" iconSize={24} />
          </PopupMenu>
        ) : undefined,
    });
    focusEventListener.current = props.navigation.addListener('didFocus', () => {
      fetchOnNavigation();
    });
    return () => {
      focusEventListener.current?.remove();
    };
  }, [
    fetchOnNavigation,
    isSchoolbookWordRendered,
    props.navigation,
    schoolbookWord?.word?.ownerId,
    schoolbookWord?.word?.shared,
    session,
    showDeleteSchoolbookWordAlert,
    userId,
  ]);

  // EVENTS =====================================================================================

  const getSchoolbookWordIds = async () => {
    const notification = props.route.params.notification;
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
      const schoolbookWordId = props.route.params.schoolbookWordId;
      const studentId = props.route.params.studentId;
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
        navBarWithBack={computeNavBar}
        onBack={() => {
          detailsCardRef?.current?.cardBottomEditorSheetRef()?.doesCommentExist()
            ? detailsCardRef?.current
                ?.cardBottomEditorSheetRef()
                ?.confirmDiscard(() => props.navigation.dispatch(CommonActions.goBack()))
            : detailsCardRef?.current?.cardSelectedCommentFieldRef()?.doesCommentExist() &&
              !detailsCardRef?.current?.cardSelectedCommentFieldRef()?.isCommentUnchanged()
            ? detailsCardRef?.current
                ?.cardSelectedCommentFieldRef()
                ?.confirmDiscard(() => props.navigation.dispatch(CommonActions.goBack()))
            : props.navigation.dispatch(CommonActions.goBack());
        }}>
        {renderPage()}
      </PageComponent>
    </>
  );
};

// MAPPING ========================================================================================

export default connect(
  () => ({
    session: assertSession(),
    initialLoadingState: AsyncPagedLoadingState.PRISTINE,
  }),
  dispatch => bindActionCreators({}, dispatch),
)(SchoolbookWordDetailsScreen);
