/**
 * Index page for push-notifs settings.
 */
import { CommonActions, NavigationProp, ParamListBase, UNSTABLE_usePreventRemove, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import deepmerge from 'deepmerge';
import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import CheckboxButton from '~/framework/components/buttons/checkbox';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen } from '~/framework/components/emptyConnectionScreen';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import { PageView } from '~/framework/components/page';
import { ISession } from '~/framework/modules//auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { updatePushNotifsSettingsAction } from '~/framework/modules/timelinev2/actions/notifSettings';
import timelineModuleConfig from '~/framework/modules/timelinev2/moduleConfig';
import {
  ITimeline_State,
  getDefaultPushNotifsSettingsByType,
  getPushNotifsSettingsByType,
} from '~/framework/modules/timelinev2/reducer';
import { IPushNotifsSettings } from '~/framework/modules/timelinev2/reducer/notifSettings/pushNotifsSettings';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { handleRemoveConfirmNavigationEvent } from '~/framework/navigation/helper';
import { navBarOptions } from '~/framework/navigation/navBar';
import Notifier from '~/framework/util/notifier';
import { shallowEqual } from '~/framework/util/object';

export interface IPushNotifsItemsListScreenDataProps {
  timelineState: ITimeline_State;
  session: ISession;
}

export interface IPushNotifsItemsListScreenEventProps {
  handleUpdatePushNotifSettings(changes: IPushNotifsSettings): Promise<void>;
}

export interface IPushNotifsItemsListScreenNavigationParams {
  type: string;
}

export type IPushNotifsItemsListScreenProps = IPushNotifsItemsListScreenDataProps &
  IPushNotifsItemsListScreenEventProps &
  NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.notifPrefsDetails>;

export enum PushNotifsItemsListLoadingState {
  PRISTINE,
  INIT,
  DONE,
  UPDATE,
}

export interface IPushNotifsItemsListScreenState {
  loadingState: PushNotifsItemsListLoadingState; // Holds the initial loading state. further page loading is handled by async.isFetching
  pendingPrefsChanges: IPushNotifsSettings;
  arePrefsUnchanged: boolean;
}

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.notifPrefsDetails>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.t('directory-notificationsTitle'),
    titleStyle: { width: undefined },
  }),
});

function PreventBack(props: { hasChanged: boolean }) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  UNSTABLE_usePreventRemove(props.hasChanged, ({ data }) => {
    Alert.alert(I18n.t('common.confirmationLeaveAlert.title'), I18n.t('common.confirmationLeaveAlert.message'), [
      {
        text: I18n.t('common.cancel'),
        style: 'cancel',
      },
      {
        text: I18n.t('common.quit'),
        style: 'destructive',
        onPress: () => {
          handleRemoveConfirmNavigationEvent(data.action, navigation);
        },
      },
    ]);
  });
  return null;
}

export class PushNotifsItemsListScreen extends React.PureComponent<
  IPushNotifsItemsListScreenProps,
  IPushNotifsItemsListScreenState
> {
  state: IPushNotifsItemsListScreenState = {
    loadingState: PushNotifsItemsListLoadingState.PRISTINE,
    pendingPrefsChanges: {},
    arePrefsUnchanged: true,
  };

  settings = this.props.timelineState.notifSettings.pushNotifsSettings;

  type = this.props.route.params.type;

  settingsForType = getPushNotifsSettingsByType(this.props.timelineState)[this.type] || {};

  defaultsForType = getDefaultPushNotifsSettingsByType(this.props.timelineState)[this.type] || {};

  initialItems = deepmerge<IPushNotifsSettings>(this.defaultsForType, this.settingsForType);

  prefKeysArray = Object.keys(this.initialItems);

  componentDidUpdate() {
    const pendingForType = Object.fromEntries(
      Object.entries(this.state.pendingPrefsChanges).filter(([k, v]) => this.prefKeysArray.includes(k)),
    );
    const items = deepmerge<IPushNotifsSettings>(this.initialItems, pendingForType);
    this.setState({
      arePrefsUnchanged: shallowEqual(this.initialItems, items),
    });
    this.props.navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <NavBarAction
          icon="ui-check"
          disabled={this.state.arePrefsUnchanged}
          onPress={() => {
            this.setState({ loadingState: PushNotifsItemsListLoadingState.UPDATE });
            this.props.handleUpdatePushNotifSettings(this.state.pendingPrefsChanges).then(() => {
              this.setState({ pendingPrefsChanges: {}, loadingState: PushNotifsItemsListLoadingState.DONE });
              this.props.navigation.dispatch(CommonActions.goBack());
            });
          }}
        />
      ),
    });
  }

  render() {
    return (
      <>
        <PreventBack hasChanged={!this.state.arePrefsUnchanged} />
        <PageView>
          <Notifier id="timeline/push-notifications" />
          {[PushNotifsItemsListLoadingState.PRISTINE, PushNotifsItemsListLoadingState.INIT].includes(this.state.loadingState) ? (
            <LoadingIndicator />
          ) : this.settings.error && !this.settings.lastSuccess ? (
            this.renderError()
          ) : (
            this.renderSubList()
          )}
        </PageView>
      </>
    );
  }

  renderSubList() {
    const type = this.props.route.params.type;
    const settingsForType = getPushNotifsSettingsByType(this.props.timelineState)[type] || {};
    const defaultsForType = getDefaultPushNotifsSettingsByType(this.props.timelineState)[type] || {};
    let items = deepmerge<IPushNotifsSettings>(defaultsForType, settingsForType);
    const prefKeysArray = Object.keys(items);
    const pendingForType = Object.fromEntries(
      Object.entries(this.state.pendingPrefsChanges).filter(([k, v]) => prefKeysArray.includes(k)),
    );
    items = deepmerge<IPushNotifsSettings>(items, pendingForType);
    const areAllChecked = Object.values(items).every(v => v);
    const subListData =
      Object.entries(items) && Object.entries(items).length > 0
        ? Object.entries(items).sort((a, b) =>
            I18n.t(`timeline.notifType.${a[0]}`).localeCompare(I18n.t(`timeline.notifType.${b[0]}`)),
          )
        : [];
    const hasEmptySubListData = subListData.length === 0;
    return (
      <FlatList
        data={subListData}
        keyExtractor={(item: [string, boolean]) => item[0]}
        renderItem={({ item }: { item: [string, boolean] }) => this.renderSubItem(item)}
        ListEmptyComponent={<EmptyConnectionScreen />}
        alwaysBounceVertical={false}
        overScrollMode="never"
        ListFooterComponent={<View style={{ height: UI_SIZES.screen.bottomInset }} />}
        ListHeaderComponent={
          hasEmptySubListData ? null : (
            <CheckboxButton
              onPress={() => this.doTogglePushNotifSettingForAppType(type, !areAllChecked)}
              title="common.all"
              isChecked={areAllChecked}
              isAllButton
            />
          )
        }
      />
    );
  }

  renderSubItem(item: [string, boolean]) {
    return (
      <CheckboxButton
        onPress={() => this.doTogglePushNotifSetting([item[0], !item[1]])}
        title={`timeline.notifType.${item[0]}`}
        isChecked={item[1]}
      />
    );
  }

  renderError() {
    return <EmptyContentScreen />;
  }

  componentDidMount() {
    this.doInit();
  }

  async doInit() {
    this.setState({ loadingState: PushNotifsItemsListLoadingState.DONE });
  }

  async doTogglePushNotifSetting(item: [string, boolean]) {
    this.setState({
      pendingPrefsChanges: {
        ...this.state.pendingPrefsChanges,
        [item[0]]: item[1],
      },
    });
  }

  async doTogglePushNotifSettingForAppType(type: string, value: boolean) {
    const settingsForType = getPushNotifsSettingsByType(this.props.timelineState)[type] || {};
    const defaultsForType = getDefaultPushNotifsSettingsByType(this.props.timelineState)[type] || {};
    const items = deepmerge<IPushNotifsSettings>(defaultsForType, settingsForType);
    const itemsWithNewValue = {} as { [k: string]: boolean };
    for (const k in items) {
      itemsWithNewValue[k] = value;
    }
    this.setState({
      pendingPrefsChanges: {
        ...this.state.pendingPrefsChanges,
        ...itemsWithNewValue,
      },
    });
  }
}

const mapStateToProps: (s: IGlobalState) => IPushNotifsItemsListScreenDataProps = s => {
  const timelineState = timelineModuleConfig.getState(s) as ITimeline_State;
  const session = getSession()!;
  return {
    timelineState,
    session,
  };
};

const mapDispatchToProps: (
  dispatch: ThunkDispatch<any, any, any>,
  getState: () => IGlobalState,
) => IPushNotifsItemsListScreenEventProps = (dispatch, getState) => ({
  handleUpdatePushNotifSettings: async (changes: IPushNotifsSettings) => {
    await dispatch(updatePushNotifsSettingsAction(changes));
  },
});

const PushNotifsItemsListScreenConnected = connect(mapStateToProps, mapDispatchToProps)(PushNotifsItemsListScreen);
export default PushNotifsItemsListScreenConnected;
