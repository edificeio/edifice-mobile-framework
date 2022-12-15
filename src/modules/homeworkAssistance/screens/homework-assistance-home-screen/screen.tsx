import I18n from 'i18n-js';
import * as React from 'react';
import { RefreshControl, SafeAreaView, View } from 'react-native';
import { NavigationEventSubscription } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import ActionButton from '~/framework/components/action-button';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import ScrollView from '~/framework/components/scrollView';
import { BodyBoldText, BodyText, SmallText } from '~/framework/components/text';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { UserType, getUserSession } from '~/framework/util/session';
import { fetchHomeworkAssistanceConfigAction } from '~/modules/homeworkAssistance/actions';
import moduleConfig from '~/modules/homeworkAssistance/moduleConfig';

import styles from './styles';
import { IHomeworkAssistanceHomeScreen_Props } from './types';

const HomeworkAssistanceHomeScreen = (props: IHomeworkAssistanceHomeScreen_Props) => {
  // LOADER =======================================================================================

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    props
      .fetchConfig()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    props
      .fetchConfig()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const fetchOnNavigation = () => {
    if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
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

  // EVENTS =======================================================================================

  const goToRequest = () => {
    props.navigation.navigate(`${moduleConfig.routeName}/request`);
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

  // INFORMATION ==================================================================================

  const renderInformation = () => {
    const { header, body, days, time, info } = props.config.messages;
    const userType = props.session.user.type;
    const isActionDisabled = ![UserType.Student, UserType.Relative].includes(userType);
    return (
      <SafeAreaView style={styles.container}>
        <BodyBoldText style={styles.primaryText}>{header}</BodyBoldText>
        <BodyText style={styles.primaryText}>{body}</BodyText>
        <Picture type="NamedSvg" name="homework-assistance-home" width="50%" style={styles.backgroundImage} />
        <View>
          <BodyText>{I18n.t('homeworkAssistance.serviceAvailable')}</BodyText>
          <View style={styles.rowContainer}>
            <Picture type="NamedSvg" name="ui-calendarLight" width={24} height={24} fill={theme.palette.secondary.regular} />
            <SmallText style={styles.secondaryText}>{days}</SmallText>
          </View>
          <View style={styles.rowContainer}>
            <Picture type="NamedSvg" name="ui-clock" width={24} height={24} fill={theme.palette.secondary.regular} />
            <SmallText style={styles.secondaryText}>{time}</SmallText>
          </View>
          <View style={styles.rowContainer}>
            <Picture type="NamedSvg" name="ui-infoCircle" width={24} height={24} fill={theme.palette.secondary.regular} />
            <SmallText style={styles.secondaryText}>{info}</SmallText>
          </View>
        </View>
        <ActionButton
          text={I18n.t('homeworkAssistance.makeARequest')}
          action={() => goToRequest()}
          disabled={isActionDisabled}
          style={isActionDisabled ? styles.actionContainerDisabled : styles.actionContainerEnabled}
        />
      </SafeAreaView>
    );
  };

  // RENDER =======================================================================================

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
      case AsyncPagedLoadingState.REFRESH:
      case AsyncPagedLoadingState.REFRESH_FAILED:
      case AsyncPagedLoadingState.REFRESH_SILENT:
        return renderInformation();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <LoadingIndicator />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  return (
    <PageView navigation={props.navigation} navBarWithBack={{ title: I18n.t('homeworkAssistance.tabName') }}>
      {renderPage()}
    </PageView>
  );
};

// MAPPING ========================================================================================

export default connect(
  (gs: IGlobalState) => {
    const state = moduleConfig.getState(gs);
    return {
      config: state.config.data,
      initialLoadingState: state.config.isPristine ? AsyncPagedLoadingState.PRISTINE : AsyncPagedLoadingState.DONE,
      session: getUserSession(),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchConfig: tryAction(fetchHomeworkAssistanceConfigAction, undefined, true),
      },
      dispatch,
    ),
)(HomeworkAssistanceHomeScreen);
