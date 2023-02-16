/**
 * Schoolbook word report
 */
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import React from 'react';
import { RefreshControl, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';

import { IGlobalState } from '~/app/store';
import ModalBox from '~/framework/components/ModalBox';
import UserList from '~/framework/components/UserList';
import { ActionButton } from '~/framework/components/buttons/action';
import { ResourceView } from '~/framework/components/card';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import FlatList from '~/framework/components/flatList';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import {
  BodyText,
  CaptionBoldText,
  CaptionItalicText,
  CaptionText,
  HeadingSText,
  SmallBoldText,
  SmallText,
} from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import { IAcknowledgment, IWordReport, getStudentsByAcknowledgementForTeacher } from '~/framework/modules/schoolbook/reducer';
import styles from '~/framework/modules/schoolbook/screens/schoolbook-word-report/styles';
import { SchoolbookWordReportScreenProps } from '~/framework/modules/schoolbook/screens/schoolbook-word-report/types';
import { schoolbookService } from '~/framework/modules/schoolbook/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import { displayPastDate } from '~/framework/util/date';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import '~/modules/schoolbook/reducer';
import { hasResendRight } from '~/modules/schoolbook/rights';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

import { SchoolbookNavigationParams, schoolbookRouteNames } from '../../navigation';

// HEADER =====================================================================================

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<SchoolbookNavigationParams, typeof schoolbookRouteNames.report>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('schoolbook.appName'),
});

// COMPONENT ======================================================================================

const SchoolbookWordReportScreen = (props: SchoolbookWordReportScreenProps) => {
  const session = props.session;
  const [schoolbookWordId, setSchoolbookWordId] = React.useState('');
  const [schoolbookWord, setSchoolbookWord] = React.useState({} as IWordReport);
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const modalBoxRef: { current: any } = React.createRef();

  // EVENTS =====================================================================================

  const getSchoolbookWordId = React.useCallback(async () => {
    const wordId = props.route.params.schoolbookWordId;
    if (!wordId) throw new Error('missing schoolbookWordId');
    setSchoolbookWordId(wordId);
    return wordId;
  }, [props.route.params.schoolbookWordId]);

  const fetchSchoolbookWord = React.useCallback(
    async wordId => {
      if (!session) throw new Error('missing session');
      const word = await schoolbookService.word.get(session, wordId);
      setSchoolbookWord(word);
    },
    [session],
  );

  const sendSchoolbookWordReminder = async () => {
    try {
      modalBoxRef?.current?.doDismissModal();
      if (!session) throw new Error('missing session');
      await schoolbookService.word.resend(session, schoolbookWordId);
      Toast.show(I18n.t('schoolbook.schoolbookWordReportScreen.reminderToast.text'), { ...UI_ANIMATIONS.toast });
    } catch {
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  // LOADER =====================================================================================

  // ToDo : Make this in a useLoadingState or <ContentLoader/>.

  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    getSchoolbookWordId()
      .then(wordId => fetchSchoolbookWord(wordId))
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  React.useEffect(() => {
    const init = () => {
      setLoadingState(AsyncPagedLoadingState.INIT);
      getSchoolbookWordId()
        .then(wordId => fetchSchoolbookWord(wordId))
        .then(() =>
          props.navigation.setOptions({
            title: schoolbookWord?.word?.title || I18n.t('schoolbook.appName'),
          }),
        )
        .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
        .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
    };
    const refreshSilent = () => {
      setLoadingState(AsyncPagedLoadingState.REFRESH_SILENT);
      getSchoolbookWordId()
        .then(wordId => fetchSchoolbookWord(wordId))
        .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
        .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
    };
    const unsubscribe = props.navigation.addListener('focus', () => {
      if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
      else refreshSilent();
    });
    return unsubscribe;
  }, [fetchSchoolbookWord, getSchoolbookWordId, props.navigation, schoolbookWord?.word?.title]);

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
    const acknowledgementsString = (ackNumber: number, total: number) =>
      `${ackNumber}/${total} ${I18n.t(`schoolbook.acknowledgement${ackNumber === 1 ? '' : 's'}`).toLowerCase()}`;
    const unacknowledgementsString = (ackNumber: number, total: number) =>
      `${total - ackNumber}/${total} ${I18n.t(
        `schoolbook.schoolbookWordReportScreen.unacknowledgement${total - ackNumber === 1 ? '' : 's'}`,
      ).toLowerCase()}`;
    const acknowledgedByString = (acknowledgments: IAcknowledgment[]) =>
      `${I18n.t('schoolbook.schoolbookWordReportScreen.acknowledgedBy')}${acknowledgments?.map(
        acknowledgment => ` ${acknowledgment.parentName}`,
      )}`;

    const acknowledgedByTextMaxLines = 1;
    const word = schoolbookWord?.word;
    const report = schoolbookWord?.report;
    const studentsByAcknowledgementForTeacher = getStudentsByAcknowledgementForTeacher(report);
    const unacknowledgedStudents = studentsByAcknowledgementForTeacher?.unacknowledged?.map(student => ({
      id: student.owner,
      name: student.ownerName,
    }));
    const acknowledgedStudents = studentsByAcknowledgementForTeacher?.acknowledged;
    const hasUnacknowledgedStudents = unacknowledgedStudents?.length;
    const hasAcknowledgedStudents = acknowledgedStudents?.length;
    const schoolbookWordResource = { shared: word?.shared, author: { userId: word?.ownerId } };
    const hasSchoolbookWordResendRights = session && hasResendRight(schoolbookWordResource, session);

    return (
      <>
        <ScrollView>
          <ResourceView>
            {hasAcknowledgedStudents ? (
              <>
                <HeadingSText style={styles.acknowledgementsTitle}>
                  {acknowledgementsString(word?.ackNumber, word?.total)}
                </HeadingSText>
                <SmallText style={styles.acknowledgementsText}>
                  {I18n.t('schoolbook.schoolbookWordReportScreen.relativesDidAcknowledge')}
                </SmallText>
                <FlatList
                  bottomInset={false}
                  style={styles.list}
                  contentContainerStyle={styles.acknowledgedStudentsContentContainer}
                  data={acknowledgedStudents}
                  initialNumToRender={acknowledgedStudents.length}
                  keyExtractor={item => item.owner}
                  renderItem={({ item, index }) => {
                    const isLastAcknowledgedStudent = index === acknowledgedStudents?.length - 1;
                    return (
                      <View
                        style={[
                          styles.acknowledgedStudentContainer,
                          isLastAcknowledgedStudent ? styles.borderBottomWidthZero : styles.borderBottomWidthOne,
                        ]}>
                        <View style={styles.acknowledgedStudentSubContainer}>
                          <SingleAvatar status={undefined} size={24} userId={item.owner} />
                          <View style={styles.acknowledgedStudentInfos}>
                            <SmallText numberOfLines={1}>{item.ownerName}</SmallText>
                            <CaptionText numberOfLines={acknowledgedByTextMaxLines} style={styles.acknowledgedBy}>
                              {acknowledgedByString(item.acknowledgments)}
                            </CaptionText>
                            {item.responses?.map((response, responseIndex) => {
                              const isLastResponse = item.responses && item.responses.length - 1 === responseIndex;
                              return (
                                <View
                                  style={[
                                    styles.responseContainer,
                                    isLastResponse ? styles.marginBottomZero : styles.marginBottomTiny,
                                  ]}>
                                  <View style={styles.responseSubContainer}>
                                    <SingleAvatar status={undefined} size={24} userId={response.owner} />
                                    <View style={styles.responseInfosContainer}>
                                      <View style={styles.responseInfos}>
                                        <CaptionBoldText numberOfLines={1} style={styles.responseParentName}>
                                          {response.parentName}
                                        </CaptionBoldText>
                                        <CaptionItalicText style={styles.responseDate}>
                                          {displayPastDate(response.modified)}
                                        </CaptionItalicText>
                                      </View>
                                      <CaptionText>{response.comment}</CaptionText>
                                    </View>
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      </View>
                    );
                  }}
                />
              </>
            ) : null}
            {hasUnacknowledgedStudents ? (
              <>
                <View
                  style={[
                    styles.unacknowledgementsHeader,
                    {
                      marginTop: hasAcknowledgedStudents ? UI_SIZES.spacing.tiny + UI_SIZES.spacing.medium : UI_SIZES.spacing.tiny,
                    },
                  ]}>
                  <HeadingSText>{unacknowledgementsString(word?.ackNumber, word?.total)}</HeadingSText>
                  {hasSchoolbookWordResendRights ? (
                    <ActionButton
                      type="secondary"
                      text={I18n.t('schoolbook.schoolbookWordReportScreen.reminder')}
                      iconName="pictos-send"
                      action={() => modalBoxRef?.current?.doShowModal()}
                    />
                  ) : null}
                </View>
                <SmallText style={styles.unacknowledgementsText}>
                  {`${I18n.t('schoolbook.schoolbookWordReportScreen.relativesDidNotAcknowledge')}${
                    hasSchoolbookWordResendRights ? ' ' + I18n.t('schoolbook.schoolbookWordReportScreen.reminderPossible') : ''
                  }`}
                </SmallText>
                <UserList
                  data={unacknowledgedStudents}
                  initialNumToRender={unacknowledgedStudents.length}
                  avatarSize={24}
                  style={styles.list}
                  contentContainerStyle={styles.userListContainer}
                  customItemStyle={styles.userListItem}
                  withSeparator
                />
              </>
            ) : null}
          </ResourceView>
        </ScrollView>
        <ModalBox
          ref={modalBoxRef}
          content={
            <>
              <HeadingSText>{I18n.t('schoolbook.schoolbookWordReportScreen.reminderModal.title')}</HeadingSText>
              <BodyText style={styles.modalBoxText}>{I18n.t('schoolbook.schoolbookWordReportScreen.reminderModal.text')}</BodyText>
              <View style={styles.modalBoxButtons}>
                <TouchableOpacity onPress={() => modalBoxRef?.current?.doDismissModal()}>
                  <SmallBoldText style={styles.modalBoxCancel}>{I18n.t('common.cancel')}</SmallBoldText>
                </TouchableOpacity>
                <ActionButton text={I18n.t('common.send')} iconName="pictos-send" action={() => sendSchoolbookWordReminder()} />
              </View>
            </>
          }
        />
      </>
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

  return <PageView>{renderPage()}</PageView>;
};

// MAPPING ========================================================================================

export default connect((state: IGlobalState) => ({
  session: getSession(state),
  initialLoadingState: AsyncPagedLoadingState.PRISTINE,
}))(SchoolbookWordReportScreen);
