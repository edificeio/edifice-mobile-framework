/**
 * Index page for push-notifs settings.
 */
import { CommonActions, UNSTABLE_usePreventRemove, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import deepmerge from 'deepmerge';
import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen } from '~/framework/components/emptyConnectionScreen';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { ListItem } from '~/framework/components/listItem';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { SmallText } from '~/framework/components/text';
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
import { NavBarAction, navBarOptions } from '~/framework/navigation/navBar';
import Notifier from '~/framework/util/notifier';
import { shallowEqual } from '~/framework/util/object';

import { UserNavigationParams, userRouteNames } from '../navigation';

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

const styles = StyleSheet.create({
  checkbox: {
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.text.light,
    borderWidth: 2,
  },
});

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.notifPrefsDetails>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('directory-notificationsTitle'),
});

function PreventBack(props: { hasChanged: boolean }) {
  const navigation = useNavigation();
  UNSTABLE_usePreventRemove(props.hasChanged, ({ data }) => {
    Alert.alert(I18n.t('common.confirmationLeaveAlert.title'), I18n.t('common.confirmationLeaveAlert.message'), [
      {
        text: I18n.t('common.cancel'),
        style: 'cancel',
      },
      {
        text: I18n.t('common.quit'),
        style: 'destructive',
        onPress: () => navigation.dispatch(data.action),
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
    console.log(this.initialItems, items);
    this.setState({
      arePrefsUnchanged: shallowEqual(this.initialItems, items),
    });
    this.props.navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <NavBarAction
          title={I18n.t('common.apply')}
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
            <TouchableOpacity onPress={() => this.doTogglePushNotifSettingForAppType(type, !areAllChecked)}>
              <ListItem
                leftElement={<SmallText>{I18n.t('common.all')}</SmallText>}
                rightElement={
                  <Checkbox
                    customCheckboxColor={areAllChecked ? theme.ui.text.light : undefined}
                    customContainerStyle={styles.checkbox}
                    checked={areAllChecked}
                    onPress={() => this.doTogglePushNotifSettingForAppType(type, !areAllChecked)}
                  />
                }
              />
            </TouchableOpacity>
          )
        }
      />
    );
  }

  renderSubItem(item: [string, boolean]) {
    return (
      <TouchableOpacity onPress={() => this.doTogglePushNotifSetting([item[0], !item[1]])}>
        <ListItem
          leftElement={<SmallText>{I18n.t(`timeline.notifType.${item[0]}`, {})}</SmallText>}
          rightElement={
            <Checkbox
              checked={item[1]}
              onPress={() => {
                this.doTogglePushNotifSetting([item[0], !item[1]]);
              }}
            />
          }
        />
      </TouchableOpacity>
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
