import * as React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import styles from './styles';
import { HomeworkAssistanceHomeScreenDispatchProps, HomeworkAssistanceHomeScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import {
  fetchHomeworkAssistanceParametersAction,
  fetchHomeworkAssistanceResourcesAction,
} from '~/framework/modules/homework-assistance/actions';
import FeedbackMenu from '~/framework/modules/homework-assistance/components/feedback-menu';
import ResourceList from '~/framework/modules/homework-assistance/components/resource-list';
import moduleConfig from '~/framework/modules/homework-assistance/module-config';
import {
  HomeworkAssistanceNavigationParams,
  homeworkAssistanceRouteNames,
} from '~/framework/modules/homework-assistance/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

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
    title: I18n.get('homeworkassistance-home-title'),
  }),
});

const HomeworkAssistanceHomeScreen = (props: HomeworkAssistanceHomeScreenPrivateProps) => {
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchInfo = async () => {
    try {
      await props.tryFetchParameters();
      await props.tryFetchResources();
    } catch {
      throw new Error();
    }
  };

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    fetchInfo()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    fetchInfo()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

  const goToRequest = () => props.navigation.navigate(homeworkAssistanceRouteNames.request, {});

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderInformation = () => {
    if (!props.parameters) return renderError();
    const { body, days, descriptionLink, header, info, link, time } = props.parameters.messages;

    return (
      <>
        <ScrollView contentContainerStyle={[styles.container, props.resources.length ? styles.containerPadding : {}]}>
          <View style={styles.parametersContainer}>
            <SmallBoldText style={styles.primaryText}>{header}</SmallBoldText>
            <SmallText style={styles.primaryText}>{body}</SmallText>
            <Svg name="homework-assistance-home" width="50%" style={styles.backgroundImage} />
            <View>
              <SmallText>{I18n.get('homeworkassistance-home-serviceavailable')}</SmallText>
              <View style={styles.rowContainer}>
                <Svg name="ui-calendarLight" width={24} height={24} fill={theme.palette.secondary.regular} />
                <SmallText style={styles.secondaryText}>{days}</SmallText>
              </View>
              <View style={styles.rowContainer}>
                <Svg name="ui-clock" width={24} height={24} fill={theme.palette.secondary.regular} />
                <SmallText style={styles.secondaryText}>{time}</SmallText>
              </View>
              <View style={styles.rowContainer}>
                <Svg name="ui-infoCircle" width={24} height={24} fill={theme.palette.secondary.regular} />
                <SmallText style={styles.secondaryText}>{info}</SmallText>
              </View>
            </View>
            <PrimaryButton text={I18n.get('homeworkassistance-home-action')} action={goToRequest} />
          </View>
          {props.resources.length ? <ResourceList resources={props.resources} /> : null}
        </ScrollView>
        <FeedbackMenu description={descriptionLink} link={link} />
      </>
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
    const session = getSession();

    return {
      initialLoadingState: homeworkAssistanceState.parameters.isPristine
        ? AsyncPagedLoadingState.PRISTINE
        : AsyncPagedLoadingState.DONE,
      parameters: homeworkAssistanceState.parameters.data,
      resources: homeworkAssistanceState.resources.data,
      session,
    };
  },
  dispatch =>
    bindActionCreators<HomeworkAssistanceHomeScreenDispatchProps>(
      {
        tryFetchParameters: tryAction(fetchHomeworkAssistanceParametersAction),
        tryFetchResources: tryAction(fetchHomeworkAssistanceResourcesAction),
      },
      dispatch,
    ),
)(HomeworkAssistanceHomeScreen);
