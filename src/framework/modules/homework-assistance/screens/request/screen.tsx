import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { Platform, RefreshControl, TextInput, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import AlertCard from '~/framework/components/alert';
import ActionButton from '~/framework/components/buttons/action';
import { UI_ANIMATIONS } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { SmallText } from '~/framework/components/text';
import { getFlattenedChildren } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import {
  fetchHomeworkAssistanceConfigAction,
  fetchHomeworkAssistanceServicesAction,
  postHomeworkAssistanceRequestAction,
} from '~/framework/modules/homework-assistance/actions';
import { getIsDateValid } from '~/framework/modules/homework-assistance/model';
import moduleConfig from '~/framework/modules/homework-assistance/module-config';
import {
  HomeworkAssistanceNavigationParams,
  homeworkAssistanceRouteNames,
} from '~/framework/modules/homework-assistance/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import DateTimePicker from '~/ui/DateTimePicker';

import styles from './styles';
import { HomeworkAssistanceRequestScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<
  HomeworkAssistanceNavigationParams,
  typeof homeworkAssistanceRouteNames.request
>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('homeworkAssistance.myRequest'),
});

const HomeworkAssistanceRequestScreen = (props: HomeworkAssistanceRequestScreenPrivateProps) => {
  const [isChildDropdownOpen, setChildDropdownOpen] = React.useState(false);
  const [isServiceDropdownOpen, setServiceDropdownOpen] = React.useState(false);
  const [child, setChild] = React.useState(props.children ? props.children[0]?.value : null);
  const [service, setService] = React.useState(null);
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [date, setDate] = React.useState(moment().startOf('day'));
  const [time, setTime] = React.useState(props.config.settings.openingTime.start);
  const [information, setInformation] = React.useState('');
  const [isSendingRequest, setSendingRequest] = React.useState(false);

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchData = async () => {
    try {
      await props.fetchConfig();
      await props.fetchServices();
    } catch {
      throw new Error();
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

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      fetchOnNavigation();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

  const sendRequest = async () => {
    try {
      const { services, children, structureName, className } = props;
      const selectedService = services.find(s => s.value === service);

      if (!selectedService) throw new Error();
      setSendingRequest(true);
      const student = children ? children.find(c => c.value === child) : undefined;
      await props.addRequest(selectedService, phoneNumber, date, time, student ?? null, structureName, className, information);
      setSendingRequest(false);
      props.navigation.goBack();
      Toast.showSuccess(I18n.t('homeworkAssistance.requestSent'), { ...UI_ANIMATIONS.toast });
    } catch {
      setSendingRequest(false);
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

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
            action={sendRequest}
            disabled={isActionDisabled}
            loading={isSendingRequest}
            style={isActionDisabled ? styles.actionContainerDisabled : styles.actionContainerEnabled}
          />
        </View>
      </ScrollView>
    );
  };

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
        return renderRequest();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <LoadingIndicator />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  const PageComponent = Platform.select<typeof KeyboardPageView | typeof PageView>({ ios: KeyboardPageView, android: PageView })!;

  return <PageComponent>{renderPage()}</PageComponent>;
};

export default connect(
  (state: IGlobalState) => {
    const homeworkAssistanceState = moduleConfig.getState(state);
    const session = getSession(state);

    return {
      children:
        session?.user.type === UserType.Relative
          ? getFlattenedChildren(session?.user.children)?.map(child => ({
              value: child.id,
              label: `${child.firstName} ${child.lastName}`,
              ...child,
            }))
          : undefined,
      className: session?.user.classes?.[0] ?? '',
      config: homeworkAssistanceState.config.data,
      initialLoadingState:
        homeworkAssistanceState.config.isPristine || homeworkAssistanceState.services.isPristine
          ? AsyncPagedLoadingState.PRISTINE
          : AsyncPagedLoadingState.DONE,
      services: homeworkAssistanceState.services.data,
      session,
      structureName: session?.user.structures?.[0].name ?? '',
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        addRequest: tryAction(
          postHomeworkAssistanceRequestAction,
          undefined,
          true,
        ) as unknown as HomeworkAssistanceRequestScreenPrivateProps['addRequest'],
        fetchConfig: tryAction(
          fetchHomeworkAssistanceConfigAction,
          undefined,
          true,
        ) as unknown as HomeworkAssistanceRequestScreenPrivateProps['fetchConfig'],
        fetchServices: tryAction(
          fetchHomeworkAssistanceServicesAction,
          undefined,
          true,
        ) as unknown as HomeworkAssistanceRequestScreenPrivateProps['fetchServices'],
      },
      dispatch,
    ),
)(HomeworkAssistanceRequestScreen);
