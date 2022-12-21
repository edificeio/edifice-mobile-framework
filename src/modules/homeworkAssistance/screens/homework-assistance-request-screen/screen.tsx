import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { Platform, RefreshControl, TextInput, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Toast from 'react-native-tiny-toast';
import { NavigationActions, NavigationEventSubscription } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import ActionButton from '~/framework/components/action-button';
import AlertCard from '~/framework/components/alert';
import { UI_ANIMATIONS } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { SmallText } from '~/framework/components/text';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { UserType, getUserSession } from '~/framework/util/session';
import {
  fetchHomeworkAssistanceConfigAction,
  fetchHomeworkAssistanceServicesAction,
  postHomeworkAssistanceRequestAction,
} from '~/modules/homeworkAssistance/actions';
import moduleConfig from '~/modules/homeworkAssistance/moduleConfig';
import { getIsDateValid } from '~/modules/homeworkAssistance/reducer';
import DateTimePicker from '~/ui/DateTimePicker';

import styles from './styles';
import { IHomeworkAssistanceRequestScreen_Props } from './types';

// COMPONENT ======================================================================================

const HomeworkAssistanceRequestScreen = (props: IHomeworkAssistanceRequestScreen_Props) => {
  const [isChildDropdownOpen, setChildDropdownOpen] = React.useState(false);
  const [isServiceDropdownOpen, setServiceDropdownOpen] = React.useState(false);
  const [child, setChild] = React.useState(props.children ? props.children[0]?.value : null);
  const [service, setService] = React.useState(null);
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [date, setDate] = React.useState(moment().startOf('day'));
  const [time, setTime] = React.useState(props.config.settings.openingTime.start);
  const [information, setInformation] = React.useState('');
  const [isSendingRequest, setSendingRequest] = React.useState(false);

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

  const sendRequest = async () => {
    try {
      const { services, children, structureName, className, addRequest } = props;
      const selectedService = services.find(s => s.value === service);
      if (!selectedService) return;
      setSendingRequest(true);
      const student = children ? children.find(c => c.value === child) : undefined;
      await addRequest(selectedService, phoneNumber, date, time, student ?? null, structureName, className, information);
      setSendingRequest(false);
      props.navigation.dispatch(NavigationActions.back());
      Toast.showSuccess(I18n.t('homeworkAssistance.requestSent'), { ...UI_ANIMATIONS.toast });
    } catch (e) {
      setSendingRequest(false);
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
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

  // REQUEST ======================================================================================

  const renderRequest = () => {
    const { openingTime } = props.config.settings;
    const isDateValid = getIsDateValid(props.config, date, time);
    const isActionDisabled = !service || !phoneNumber || !isDateValid;
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          {props.children ? (
            <DropDownPicker
              open={isChildDropdownOpen}
              value={child}
              items={props.children}
              setOpen={setChildDropdownOpen}
              setValue={setChild}
              style={styles.dropdownContainer}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              zIndex={2000}
              zIndexInverse={1000}
            />
          ) : undefined}
          <DropDownPicker
            open={isServiceDropdownOpen}
            value={service}
            items={props.services}
            setOpen={setServiceDropdownOpen}
            setValue={setService}
            placeholder={I18n.t('homeworkAssistance.chooseASubject')}
            style={styles.dropdownContainer}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
            zIndex={1000}
            zIndexInverse={2000}
          />
          <SmallText style={styles.textMargin}>{I18n.t('homeworkAssistance.phoneNumberToCallYouBackOn')}</SmallText>
          <TextInput
            placeholder="+33 (0)6..."
            value={phoneNumber}
            onChangeText={text => setPhoneNumber(text.replace(/[^+0-9]/g, ''))}
            keyboardType="phone-pad"
            style={styles.phoneNumberInput}
          />
          <View style={styles.rowContainer}>
            <SmallText>{I18n.t('homeworkAssistance.dateOfCall')}</SmallText>
            <DateTimePicker mode="date" value={date} onChange={value => setDate(value)} color={theme.palette.secondary.regular} />
          </View>
          <View style={styles.rowContainer}>
            <SmallText>{I18n.t('homeworkAssistance.time')}</SmallText>
            <DateTimePicker
              mode="time"
              value={time}
              onChange={value => setTime(value)}
              minimumDate={openingTime.start}
              maximumDate={openingTime.end}
              color={theme.palette.secondary.regular}
            />
          </View>
          <SmallText style={styles.textMargin}>{I18n.t('homeworkAssistance.additionalInformation')}</SmallText>
          <TextInput
            placeholder={I18n.t('homeworkAssistance.detailsAbout')}
            value={information}
            onChangeText={text => setInformation(text)}
            multiline
            textAlignVertical="top"
            style={styles.informationInput}
          />
        </View>
        <View>
          {!isDateValid ? (
            <AlertCard type="failure" text={I18n.t('homeworkAssistance.serviceClosedError')} style={styles.errorAlert} />
          ) : null}
          <ActionButton
            text={I18n.t('homeworkAssistance.sendMyRequest')}
            action={() => sendRequest()}
            disabled={isActionDisabled}
            loading={isSendingRequest}
            style={isActionDisabled ? styles.actionContainerDisabled : styles.actionContainerEnabled}
          />
        </View>
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
        return renderRequest();
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
      children:
        gs.user.info.type === UserType.Relative
          ? Object.entries(gs.user.info.children).map(([key, value]: [string, any]) => {
              return {
                value: key,
                label: `${value.firstName} ${value.lastName}`,
                ...value,
              };
            })
          : undefined,
      className: gs.user.info.classNames[0] ?? '',
      config: state.config.data,
      initialLoadingState:
        state.config.isPristine || state.services.isPristine ? AsyncPagedLoadingState.PRISTINE : AsyncPagedLoadingState.DONE,
      services: state.services.data,
      session: getUserSession(),
      structureName: gs.user.info.structureNames[0] ?? '',
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        addRequest: tryAction(postHomeworkAssistanceRequestAction, undefined, true),
        fetchConfig: tryAction(fetchHomeworkAssistanceConfigAction, undefined, true),
        fetchServices: tryAction(fetchHomeworkAssistanceServicesAction, undefined, true),
      },
      dispatch,
    ),
)(HomeworkAssistanceRequestScreen);
