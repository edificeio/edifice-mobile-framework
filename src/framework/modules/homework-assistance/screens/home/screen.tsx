import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { RefreshControl, SafeAreaView, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import ActionButton from '~/framework/components/buttons/action';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import ScrollView from '~/framework/components/scrollView';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import { fetchHomeworkAssistanceConfigAction } from '~/framework/modules/homework-assistance/actions';
import moduleConfig from '~/framework/modules/homework-assistance/module-config';
import {
  HomeworkAssistanceNavigationParams,
  homeworkAssistanceRouteNames,
} from '~/framework/modules/homework-assistance/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import styles from './styles';
import { HomeworkAssistanceHomeScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<
  HomeworkAssistanceNavigationParams,
  typeof homeworkAssistanceRouteNames.home
>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('homeworkAssistance.tabName'),
});

const HomeworkAssistanceHomeScreen = (props: HomeworkAssistanceHomeScreenPrivateProps) => {
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

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      fetchOnNavigation();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

  const goToRequest = () => props.navigation.navigate(homeworkAssistanceRouteNames.request);

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderInformation = () => {
    const { header, body, days, time, info } = props.config.messages;
    return (
      <SafeAreaView style={styles.container}>
        <SmallBoldText style={styles.primaryText}>{header}</SmallBoldText>
        <SmallText style={styles.primaryText}>{body}</SmallText>
        <Picture type="NamedSvg" name="homework-assistance-home" width="50%" style={styles.backgroundImage} />
        <View>
          <SmallText>{I18n.t('homeworkAssistance.serviceAvailable')}</SmallText>
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
        <ActionButton text={I18n.t('homeworkAssistance.makeARequest')} action={goToRequest} style={styles.actionContainer} />
      </SafeAreaView>
    );
  };

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
        return renderInformation();
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
    const homeworkAssistanceState = moduleConfig.getState(state);
    const session = getSession(state);

    return {
      config: homeworkAssistanceState.config.data,
      initialLoadingState: homeworkAssistanceState.config.isPristine
        ? AsyncPagedLoadingState.PRISTINE
        : AsyncPagedLoadingState.DONE,
      session,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchConfig: tryAction(
          fetchHomeworkAssistanceConfigAction,
          undefined,
          true,
        ) as unknown as HomeworkAssistanceHomeScreenPrivateProps['fetchConfig'],
      },
      dispatch,
    ),
)(HomeworkAssistanceHomeScreen);
