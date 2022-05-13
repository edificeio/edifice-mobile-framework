/**
 * Schoolbook word list
 */
import I18n from 'i18n-js';
import React from 'react';
import { Alert, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { NavigationEventSubscription, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ActionsMenu from '~/framework/components/actionsMenu';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { HeaderIcon } from '~/framework/components/header';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { computeRelativePath } from '~/framework/util/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { IUserSession, UserType, getUserSession } from '~/framework/util/session';
import moduleConfig from '~/modules/schoolbook/moduleConfig';

import SchoolbookWordDetailsCard from '../components/SchoolbookWordDetailsCard';
import { IWordReport } from '../reducer';
import { getSchoolbookWorkflowInformation } from '../rights';
import { schoolbookService, schoolbookUriCaptureFunction } from '../service';

// TYPES ==========================================================================================

export interface ISchoolbookWordListScreen_DataProps {
  initialLoadingState: AsyncPagedLoadingState;
  session: IUserSession;
}
export type ISchoolbookWordListScreen_Props = ISchoolbookWordListScreen_DataProps & NavigationInjectedProps;

// COMPONENT ======================================================================================

const SchoolbookWordDetailsScreen = (props: ISchoolbookWordListScreen_Props) => {
  const session = props.session;
  const userId = session?.user?.id;
  const userType = session?.user?.type;
  const isTeacher = userType === UserType.Teacher;
  const isParent = userType === UserType.Relative;
  const hasSchoolbookWordCreationRights = getSchoolbookWorkflowInformation(session).create;
  const menuData = [
    {
      text: I18n.t('common.delete'),
      icon: 'trash',
      onPress: () => showDeleteSchoolbookWordAlert(),
    },
  ];
  let focusEventListener: NavigationEventSubscription;

  // LOADER =====================================================================================

  // ToDo : Make this in a useLoadingState.

  const [schoolbookWordId, setSchoolbookWordId] = React.useState('');
  const [studentId, setStudentId] = React.useState('');
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const [isPublishingReply, setIsPublishingReply] = React.useState(false);
  const isSchoolbookWordRendered =
    loadingState === AsyncPagedLoadingState.DONE ||
    loadingState === AsyncPagedLoadingState.REFRESH_SILENT ||
    loadingState === AsyncPagedLoadingState.REFRESH_FAILED;
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  React.useEffect(() => {
    if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
    else refreshSilent();
    // focusEventListener = props.navigation.addListener('didFocus', () => {
    //   if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
    //   else refreshSilent();
    // });
    // return () => {
    //   focusEventListener.remove();
    // };
  }, []);

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
    getSchoolbookWordIds()
      .then(schoolbookWordId => fetchSchoolbookWord(schoolbookWordId))
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
  };

  // EVENTS =====================================================================================

  const [schoolbookWord, setSchoolbookWord] = React.useState({} as IWordReport);

  const getSchoolbookWordIds = async () => {
    const notification = props.navigation.getParam('notification');
    let ids;
    if (notification) {
      const resourceUri = notification?.resource.uri;
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
      await schoolbookService.word.acknowledge(session, schoolbookWordId, studentId);
      refreshSilent();
    } catch (e) {
      Toast.show(I18n.t('common.error.text'));
    }
  };

  const replyToSchoolbookWord = async (comment: string, commentId?: string) => {
    try {
      setIsPublishingReply(true);
      commentId
        ? await schoolbookService.word.updateReply(session, schoolbookWordId, commentId, comment)
        : await schoolbookService.word.reply(session, schoolbookWordId, studentId, comment);
      refreshSilent();
    } catch (e) {
      Toast.show(I18n.t('common.error.text'));
    } finally {
      setIsPublishingReply(false);
    }
  };

  const deleteSchoolbookWord = async () => {
    try {
      await schoolbookService.word.delete(session, schoolbookWordId);
      props.navigation.goBack();
    } catch (e) {
      Toast.show(I18n.t('common.error.text'));
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
  const navBarInfo = {
    title: I18n.t('schoolbook.appName'),
    right:
      isSchoolbookWordRendered && hasSchoolbookWordCreationRights && isUserSchoolbookWordOwner ? (
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

  const detailsCardRef: { current: any } = React.createRef();
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

  return (
    <>
      <PageView navigation={props.navigation} navBarWithBack={navBarInfo}>
        {renderPage()}
      </PageView>
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
