import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { ActionButton } from '~/framework/components/buttons/action';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { Icon } from '~/framework/components/picture/Icon';
import ScrollView from '~/framework/components/scrollView';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { LeftColoredItem } from '~/framework/modules/viescolaire/dashboard/components/Item';
import { fetchPresencesClassCallAction } from '~/framework/modules/viescolaire/presences/actions';
import StudentRow from '~/framework/modules/viescolaire/presences/components/StudentRow';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { deleteEvent, postAbsentEvent, validateRegisterAction } from '~/modules/viescolaire/presences/actions/events';

import styles from './styles';
import { PresencesCallScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.call>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('viesco-register'),
  headerStyle: {
    backgroundColor: viescoTheme.palette.presences,
  },
});

const PresencesCallScreen = (props: PresencesCallScreenPrivateProps) => {
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchCall = async () => {
    try {
      const { id } = props.route.params;

      if (!id) throw new Error();
      await props.fetchClassCall(id);
    } catch {
      throw new Error();
    }
  };

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    fetchCall()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    fetchCall()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const refresh = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH);
    fetchCall()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
  };

  const fetchOnNavigation = () => {
    if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
  };

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      fetchOnNavigation();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

  const renderError = () => {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={() => reload()} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderStudentsList = () => {
    const { classCall, navigation } = props;
    const { id } = props.route.params;
    const students = classCall!.students.sort((a, b) => a.name.localeCompare(b.name));

    return classCall && students.length > 0 ? (
      <>
        <FlatList
          data={students}
          renderItem={({ item }) => (
            <StudentRow
              student={item}
              mementoNavigation={() => props.navigation.navigate(presencesRouteNames.memento, { studentId: item.id })}
              lateCallback={event =>
                navigation.navigate(presencesRouteNames.declareEvent, {
                  type: 'late',
                  registerId: id,
                  student: item,
                  startDate: classCall.start_date,
                  endDate: classCall.end_date,
                  event,
                })
              }
              leavingCallback={event =>
                navigation.navigate(presencesRouteNames.declareEvent, {
                  type: 'leaving',
                  registerId: id,
                  student: item,
                  startDate: classCall.start_date,
                  endDate: classCall.end_date,
                  event,
                })
              }
              checkAbsent={() => {
                props.postAbsentEvent(item.id, id, moment(state.callData.start_date), moment(state.callData.end_date));
              }}
              uncheckAbsent={event => {
                props.deleteEvent(event);
              }}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={() => refresh()} />
          }
        />
        <ActionButton
          text={I18n.t('viesco-validate')}
          action={() => {
            props.validateRegister(id);
            navigation.goBack();
          }}
          style={styles.validateButton}
        />
      </>
    ) : null;
  };

  const renderClassCall = () => {
    const { classCall } = props;
    const { classroom, name } = props.route.params;

    return classCall ? (
      <>
        <LeftColoredItem shadow style={styles.headerCard} color={viescoTheme.palette.presences}>
          <SmallText>
            {moment(classCall.start_date).format('LT')} - {moment(classCall.end_date).format('LT')}
          </SmallText>
          {classroom ? (
            <View style={styles.classroomContainer}>
              <Icon name="pin_drop" size={18} />
              <SmallText style={styles.classroomText}>{I18n.t('viesco-room') + ' ' + classroom}</SmallText>
            </View>
          ) : null}
          <SmallBoldText style={styles.nameText}>{name}</SmallBoldText>
        </LeftColoredItem>
        {renderStudentsList()}
      </>
    ) : null;
  };

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
      case AsyncPagedLoadingState.REFRESH:
      case AsyncPagedLoadingState.REFRESH_FAILED:
      case AsyncPagedLoadingState.REFRESH_SILENT:
        return renderClassCall();
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

export default connect(
  (state: IGlobalState) => {
    const presencesState = moduleConfig.getState(state);

    return {
      classCall: presencesState.classCall.data,
      initialLoadingState: AsyncPagedLoadingState.PRISTINE,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchClassCall: tryAction(fetchPresencesClassCallAction, undefined, true),
        postAbsentEvent: tryAction(postAbsentEvent, undefined, true),
        deleteEvent: tryAction(deleteEvent, undefined, true),
        validateRegister: tryAction(validateRegisterAction, undefined, true),
      },
      dispatch,
    ),
)(PresencesCallScreen);
