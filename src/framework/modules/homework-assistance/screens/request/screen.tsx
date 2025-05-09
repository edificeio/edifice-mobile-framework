import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import * as React from 'react';
import { Platform, RefreshControl, ScrollView, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import AlertCard from '~/framework/components/alert';
import PrimaryButton from '~/framework/components/buttons/primary';
import DateTimePicker from '~/framework/components/dateTimePicker';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import TextInput from '~/framework/components/inputs/text';
import { LoadingIndicator } from '~/framework/components/loading';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import DropdownPicker from '~/framework/components/pickers/dropdown';
import { SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { AccountType, getFlattenedChildren } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
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

import styles from './styles';
import { HomeworkAssistanceRequestScreenDispatchProps, HomeworkAssistanceRequestScreenPrivateProps } from './types';

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
    title: I18n.get('homeworkassistance-request-title'),
  }),
});

const HomeworkAssistanceRequestScreen = (props: HomeworkAssistanceRequestScreenPrivateProps) => {
  const [isChildDropdownOpen, setChildDropdownOpen] = React.useState(false);
  const [isServiceDropdownOpen, setServiceDropdownOpen] = React.useState(false);
  const [child, setChild] = React.useState(props.children ? props.children[0]?.value : null);
  const [service, setService] = React.useState(null);
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [date, setDate] = React.useState(moment().startOf('day'));
  const [time, setTime] = React.useState(props.config!.settings.openingTime.start);
  const [information, setInformation] = React.useState('');
  const [isSendingRequest, setSendingRequest] = React.useState(false);

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchData = async () => {
    try {
      await props.tryFetchConfig();
      await props.tryFetchServices();
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

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

  const sendRequest = async () => {
    try {
      const { children, className, services, structureName } = props;
      const selectedService = services.find(s => s.value === service);

      if (!selectedService) throw new Error();
      setSendingRequest(true);
      const student = children ? children.find(c => c.value === child) : undefined;
      await props.tryAddRequest(selectedService, phoneNumber, date, time, student ?? null, structureName, className, information);
      setSendingRequest(false);
      props.navigation.goBack();
      Toast.showSuccess(I18n.get('homeworkassistance-request-successmessage'));
    } catch {
      setSendingRequest(false);
      Toast.showError(I18n.get('homeworkassistance-request-error-text'));
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
    if (!props.config) return renderError();
    const { openingTime } = props.config.settings;
    const isDateValid = getIsDateValid(props.config, date, time);
    const isActionDisabled = !service || !phoneNumber || !isDateValid;

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          {props.children ? (
            <DropdownPicker
              open={isChildDropdownOpen}
              value={child}
              items={props.children}
              setOpen={setChildDropdownOpen}
              setValue={setChild}
              style={styles.dropdownContainer}
            />
          ) : undefined}
          <DropdownPicker
            open={isServiceDropdownOpen}
            value={service}
            items={props.services}
            setOpen={setServiceDropdownOpen}
            setValue={setService}
            placeholder={I18n.get('homeworkassistance-request-subject-placeholder')}
            style={styles.dropdownContainer}
            containerStyle={{ zIndex: -1 }}
          />
          <View style={{ zIndex: -2 }}>
            <SmallText style={styles.textMargin}>{I18n.get('homeworkassistance-request-phonenumber')}</SmallText>
            <TextInput
              placeholder="+33 (0)6..."
              value={phoneNumber}
              onChangeText={text => setPhoneNumber(text.replace(/[^+0-9]/g, ''))}
              keyboardType="phone-pad"
              style={styles.phoneNumberInput}
            />
            <View style={styles.rowContainer}>
              <SmallText>{I18n.get('homeworkassistance-request-date-label')}</SmallText>
              <DateTimePicker
                mode="date"
                value={date}
                onChangeValue={value => setDate(value)}
                minimumDate={moment().startOf('day')}
                iconColor={theme.palette.secondary.regular}
              />
            </View>
            <View style={styles.rowContainer}>
              <SmallText>{I18n.get('homeworkassistance-request-time')}</SmallText>
              <DateTimePicker
                mode="time"
                value={time}
                onChangeValue={value => setTime(value)}
                minimumDate={openingTime.start}
                maximumDate={openingTime.end}
                iconColor={theme.palette.secondary.regular}
              />
            </View>
            <SmallText style={styles.textMargin}>{I18n.get('homeworkassistance-request-information-label')}</SmallText>
            <TextInput
              placeholder={I18n.get('homeworkassistance-request-information-placeholder')}
              value={information}
              onChangeText={text => setInformation(text)}
              multiline
              textAlignVertical="top"
              style={styles.informationInput}
            />
          </View>
        </View>
        <View>
          {!isDateValid ? (
            <AlertCard type="error" text={I18n.get('homeworkassistance-request-date-error')} style={styles.errorAlert} />
          ) : null}
          <PrimaryButton
            text={I18n.get('homeworkassistance-request-action')}
            action={sendRequest}
            disabled={isActionDisabled}
            loading={isSendingRequest}
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

  const PageComponent = Platform.select<typeof KeyboardPageView | typeof PageView>({ android: PageView, ios: KeyboardPageView })!;

  return <PageComponent>{renderPage()}</PageComponent>;
};

export default connect(
  (state: IGlobalState) => {
    const homeworkAssistanceState = moduleConfig.getState(state);
    const session = getSession();

    return {
      children:
        session?.user.type === AccountType.Relative
          ? getFlattenedChildren(session?.user.children)?.map(child => ({
              label: `${child.firstName} ${child.lastName}`,
              value: child.id,
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
  dispatch =>
    bindActionCreators<HomeworkAssistanceRequestScreenDispatchProps>(
      {
        tryAddRequest: tryAction(postHomeworkAssistanceRequestAction),
        tryFetchConfig: tryAction(fetchHomeworkAssistanceConfigAction),
        tryFetchServices: tryAction(fetchHomeworkAssistanceServicesAction),
      },
      dispatch,
    ),
)(HomeworkAssistanceRequestScreen);
