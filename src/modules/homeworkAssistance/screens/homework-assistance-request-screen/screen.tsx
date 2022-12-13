import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { Platform, RefreshControl, TextInput, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { NavigationEventSubscription } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import ActionButton from '~/framework/components/action-button';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { SmallText } from '~/framework/components/text';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { getUserSession } from '~/framework/util/session';
import { fetchHomeworkAssistanceConfigAction, fetchHomeworkAssistanceServicesAction } from '~/modules/homeworkAssistance/actions';
import moduleConfig from '~/modules/homeworkAssistance/moduleConfig';
import DateTimePicker from '~/ui/DateTimePicker';

import styles from './styles';
import { IHomeworkAssistanceRequestScreen_Props } from './types';

// COMPONENT ======================================================================================

const HomeworkAssistanceRequestScreen = (props: IHomeworkAssistanceRequestScreen_Props) => {
  const [isServiceDropdownOpen, setServiceDropdownOpen] = React.useState(false);
  const [service, setService] = React.useState(null);
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [date, setDate] = React.useState(moment());
  const [time, setTime] = React.useState(moment());
  const [information, setInformation] = React.useState('');

  // LOADER =======================================================================================

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchData = async () => {
    try {
      await props.fetchConfig();
      await props.fetchServices();
    } catch (e) {
      throw e;
    }
  };

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    fetchData()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    fetchData()
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
    return (
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <DropDownPicker
          open={isServiceDropdownOpen}
          value={service}
          items={props.services}
          setOpen={setServiceDropdownOpen}
          setValue={setService}
          placeholder={I18n.t('homeworkAssistance.chooseASubject')}
        />
        <View>
          <SmallText style={styles.textMargin}>{I18n.t('homeworkAssistance.phoneNumberToCallYouBackOn')}</SmallText>
          <TextInput
            placeholder="+33 (0)6..."
            value={phoneNumber}
            onChangeText={text => setPhoneNumber(text)}
            keyboardType="phone-pad"
            style={styles.phoneNumberInput}
          />
        </View>
        <View>
          <View style={[styles.rowContainer, styles.dateMargin]}>
            <SmallText>{I18n.t('homeworkAssistance.dateOfCall')}</SmallText>
            <DateTimePicker mode="date" value={date} onChange={value => setDate(value)} />
          </View>
          <View style={styles.rowContainer}>
            <SmallText>{I18n.t('homeworkAssistance.time')}</SmallText>
            <DateTimePicker mode="time" value={time} onChange={value => setTime(value)} />
          </View>
        </View>
        <View>
          <SmallText style={styles.textMargin}>{I18n.t('homeworkAssistance.additionalInformation')}</SmallText>
          <TextInput
            placeholder={I18n.t('homeworkAssistance.detailsAbout')}
            value={information}
            onChangeText={text => setInformation(text)}
            multiline
            style={styles.informationInput}
          />
        </View>
        <ActionButton text={I18n.t('homeworkAssistance.sendMyRequest')} action={() => true} style={styles.actionContainer} />
      </ScrollView>
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

  const PageComponent = Platform.select({ ios: KeyboardPageView, android: PageView })!;

  return (
    <PageComponent
      navigation={props.navigation}
      navBarWithBack={{ title: I18n.t('homeworkAssistance.myRequest') }}
      safeArea={false}>
      {renderPage()}
    </PageComponent>
  );
};

// MAPPING ========================================================================================

export default connect(
  (gs: IGlobalState) => {
    const state = moduleConfig.getState(gs);
    return {
      config: state.config.data,
      initialLoadingState:
        state.config.isPristine || state.services.isPristine ? AsyncPagedLoadingState.PRISTINE : AsyncPagedLoadingState.DONE,
      services: state.services.data.map((service, index) => {
        return { label: service, value: index.toString() };
      }),
      session: getUserSession(),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchConfig: tryAction(fetchHomeworkAssistanceConfigAction, undefined, true),
        fetchServices: tryAction(fetchHomeworkAssistanceServicesAction, undefined, true),
      },
      dispatch,
    ),
)(HomeworkAssistanceRequestScreen);
