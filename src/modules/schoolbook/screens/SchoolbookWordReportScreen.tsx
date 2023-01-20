/**
 * Schoolbook word report
 */
import I18n from 'i18n-js';
import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { NavigationEventSubscription, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { UI_ANIMATIONS } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { HeaderTitleAndSubtitle } from '~/framework/components/header';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { IUserSession, getUserSession } from '~/framework/util/session';
import SchoolbookWordReportCard from '~/modules/schoolbook/components/SchoolbookWordReportCard';
import { IWordReport } from '~/modules/schoolbook/reducer';
import { schoolbookService } from '~/modules/schoolbook/service';

// TYPES ==========================================================================================

export interface ISchoolbookWordReportScreen_DataProps {
  initialLoadingState: AsyncPagedLoadingState;
  session: IUserSession;
}
export type ISchoolbookWordReportScreen_Props = ISchoolbookWordReportScreen_DataProps & NavigationInjectedProps;

// COMPONENT ======================================================================================

const SchoolbookWordReportScreen = (props: ISchoolbookWordReportScreen_Props) => {
  const reportCardRef: { current: any } = React.useRef();
  const session = props.session;
  let focusEventListener: NavigationEventSubscription;

  // LOADER =====================================================================================

  // ToDo : Make this in a useLoadingState or <ContentLoader/>.

  const [schoolbookWordId, setSchoolbookWordId] = React.useState('');
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
    getSchoolbookWordId()
      .then(schoolbookWordId => fetchSchoolbookWord(schoolbookWordId))
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    getSchoolbookWordId()
      .then(schoolbookWordId => fetchSchoolbookWord(schoolbookWordId))
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const refreshSilent = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH_SILENT);
    getSchoolbookWordId()
      .then(schoolbookWordId => fetchSchoolbookWord(schoolbookWordId))
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
  };

  // EVENTS =====================================================================================

  const [schoolbookWord, setSchoolbookWord] = React.useState({} as IWordReport);

  const getSchoolbookWordId = async () => {
    const schoolbookWordId = props.navigation.getParam('schoolbookWordId');
    if (!schoolbookWordId) throw new Error('missing schoolbookWordId');
    setSchoolbookWordId(schoolbookWordId);
    return schoolbookWordId;
  };

  const fetchSchoolbookWord = async schoolbookWordId => {
    try {
      const schoolbookWord = await schoolbookService.word.get(session, schoolbookWordId);
      setSchoolbookWord(schoolbookWord);
    } catch (e) {
      throw e;
    }
  };

  const sendSchoolbookWordReminder = async () => {
    try {
      reportCardRef?.current?.cardModalBoxRef()?.doDismissModal();
      await schoolbookService.word.resend(session, schoolbookWordId);
      Toast.show(I18n.t('schoolbook.schoolbookWordReportScreen.reminderToast.text'), { ...UI_ANIMATIONS.toast });
    } catch (e) {
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  // HEADER =====================================================================================

  const navBarInfo = {
    title: schoolbookWord?.word?.title ? (
      <HeaderTitleAndSubtitle title={schoolbookWord.word.title} subtitle={I18n.t('schoolbook.appName')} />
    ) : (
      I18n.t('schoolbook.appName')
    ),
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

  const renderSchoolbookWordReport = () => {
    return (
      <SchoolbookWordReportCard
        ref={reportCardRef}
        session={session}
        action={() => sendSchoolbookWordReminder()}
        schoolbookWord={schoolbookWord}
      />
    );
  };

  // RENDER =======================================================================================

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
      case AsyncPagedLoadingState.REFRESH_SILENT:
      case AsyncPagedLoadingState.REFRESH_FAILED:
        return renderSchoolbookWordReport();
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
)(SchoolbookWordReportScreen);
