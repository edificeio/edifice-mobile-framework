/**
 * Index page for push-notifs settings.
 */

import deepmerge from 'deepmerge';
import I18n from 'i18n-js';
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { NavigationActions, NavigationInjectedProps, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { Checkbox } from '~/framework/components/checkbox';
import { Icon } from '~/framework/components/icon';
import { ListItem } from '~/framework/components/listItem';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { Text, TextAction, TextSizeStyle } from '~/framework/components/text';
import { loadPushNotifsSettingsAction, updatePushNotifsSettingsAction } from '~/framework/modules/timelinev2/actions/notifSettings';
import timelineModuleConfig from '~/framework/modules/timelinev2/moduleConfig';
import {
  getDefaultPushNotifsSettingsByType,
  getPushNotifsSettingsByType,
  IPushNotifsSettingsByType,
  ITimeline_State,
} from '~/framework/modules/timelinev2/reducer';
import { IPushNotifsSettings } from '~/framework/modules/timelinev2/reducer/notifSettings/pushNotifsSettings';
import Notifier from '~/framework/util/notifier';
import { getUserSession, IUserSession } from '~/framework/util/session';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyConnectionScreen } from '~/framework/components/emptyConnectionScreen';

// TYPES ==========================================================================================

export interface IPushNotifsSettingsScreenDataProps {
  timelineState: ITimeline_State;
  session: IUserSession;
}

export interface IPushNotifsSettingsScreenEventProps {
  handleInitPushNotifsSettings(): Promise<void>;
  handleUpdatePushNotifSettings(changes: IPushNotifsSettings): Promise<void>;
}

export interface IPushNotifsSettingsScreenNavigationParams {
  type: string;
}

export type IPushNotifsSettingsScreenProps = IPushNotifsSettingsScreenDataProps &
  IPushNotifsSettingsScreenEventProps &
  NavigationInjectedProps<Partial<IPushNotifsSettingsScreenNavigationParams>>;

export enum PushNotifsSettingsLoadingState {
  PRISTINE,
  INIT,
  DONE,
  UPDATE,
}

export interface IPushNotifsSettingsScreenState {
  loadingState: PushNotifsSettingsLoadingState; // Holds the initial loading state. further page loading is handled by async.isFetching
  pendingPrefsChanges: IPushNotifsSettings;
}

// COMPONENT ======================================================================================

export class PushNotifsSettingsScreen extends React.PureComponent<IPushNotifsSettingsScreenProps, IPushNotifsSettingsScreenState> {
  // DECLARATIONS =================================================================================

  state: IPushNotifsSettingsScreenState = {
    loadingState: PushNotifsSettingsLoadingState.PRISTINE,
    pendingPrefsChanges: {},
  };

  // RENDER =======================================================================================

  render() {
    const { navigation, timelineState, handleUpdatePushNotifSettings } = this.props;
    const { loadingState, pendingPrefsChanges } = this.state;
    const settings = timelineState.notifSettings.pushNotifsSettings;
    const hasPendingPrefsChanges = Object.keys(pendingPrefsChanges).length > 0;
    const navBarInfo = {
      title: I18n.t('directory-notificationsTitle'),
      ...([PushNotifsSettingsLoadingState.UPDATE].includes(loadingState)
        ? {
            left: (
              <LoadingIndicator
                small
                customColor={theme.color.neutral.extraLight}
                customStyle={{ justifyContent: 'center', paddingHorizontal: 22 }}
              />
            ),
          }
        : {}),
    };
    return (
      <PageView
        navigation={navigation}
        {...([PushNotifsSettingsLoadingState.UPDATE].includes(loadingState)
          ? { navBar: navBarInfo }
          : {
              navBarWithBack: navBarInfo,
              onBack: () => {
                if (hasPendingPrefsChanges) {
                  this.setState({ loadingState: PushNotifsSettingsLoadingState.UPDATE });
                  handleUpdatePushNotifSettings(pendingPrefsChanges).then(() => {
                    this.setState({ pendingPrefsChanges: {}, loadingState: PushNotifsSettingsLoadingState.DONE });
                    navigation.dispatch(NavigationActions.back());
                  });
                } else {
                  return true;
                }
              },
            })}>
        <Notifier id="timeline/push-notifications" />
        {[PushNotifsSettingsLoadingState.PRISTINE, PushNotifsSettingsLoadingState.INIT].includes(loadingState) ? (
          <LoadingIndicator />
        ) : settings.error && !settings.lastSuccess ? (
          this.renderError()
        ) : navigation.getParam('type') ? (
          this.renderSubList()
        ) : (
          this.renderMainList()
        )}
      </PageView>
    );
  }

  renderMainList() {
    // console.log("=== renderMainList")
    const settings = getPushNotifsSettingsByType(this.props.timelineState);
    // console.log("settings", settings);
    const defaults = getDefaultPushNotifsSettingsByType(this.props.timelineState);
    // console.log("defaults", defaults);
    let items = deepmerge<IPushNotifsSettingsByType>(defaults, settings);
    // console.log("items", items);
    // console.log("entcoreApps", this.props.session.user.entcoreApps);
    // console.log("timeline filters", this.props.timelineState.notifDefinitions.notifFilters);
    items = Object.fromEntries(
      Object.entries(items).filter(item => {
        const notifFilter = this.props.timelineState.notifDefinitions.notifFilters.data.find(tf => tf.type === item[0]);
        return this.props.session.user.entcoreApps.find(app => !app.name || app.name === notifFilter?.['app-name']);
      }),
    );
    const mainListData =
      Object.entries(items) && Object.entries(items).length > 0
        ? Object.entries(items).sort((a, b) => translateMainItem(a).localeCompare(translateMainItem(b)))
        : [];
    return (
      <FlatList
        data={mainListData}
        keyExtractor={(item: [string, IPushNotifsSettings]) => item[0]}
        renderItem={({ item }: { item: [string, IPushNotifsSettings] }) => this.renderMainItem(item)}
        ListEmptyComponent={<EmptyConnectionScreen />}
        alwaysBounceVertical={false}
        ListFooterComponent={<View style={{ height: UI_SIZES.bottomInset }} />}
      />
    );
  }

  renderMainItem(item: [string, IPushNotifsSettings]) {
    const type = item[0];
    const settingsForType = getPushNotifsSettingsByType(this.props.timelineState)[type] || {};
    const defaultsForType = getDefaultPushNotifsSettingsByType(this.props.timelineState)[type] || {};
    const items = deepmerge<IPushNotifsSettings>(defaultsForType, settingsForType);
    const itemsValues = Object.values(items);
    const total = itemsValues.length;
    const totalOn = itemsValues.filter(v => v).length;
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigation.dispatch(
            StackActions.push({
              routeName: 'NotifPrefs',
              params: {
                type: item[0],
              },
            }),
          );
        }}>
        <ListItem
          leftElement={<Text>{translateMainItem(item)}</Text>}
          rightElement={
            <View style={{ flexDirection: 'row' }}>
              <TextAction style={{ ...TextSizeStyle.Small }}>
                {I18n.t(`user.pushNotifsSettingsScreen.countOutOfTotal`, {
                  count: totalOn,
                  total,
                })}
              </TextAction>
              <Icon
                name="arrow_down"
                color={theme.color.secondary.regular}
                style={{ flex: 0, marginLeft: 20, transform: [{ rotate: '270deg' }] }}
              />
            </View>
          }
        />
      </TouchableOpacity>
    );
  }

  renderSubList() {
    console.log('=== renderSubList');
    const type = this.props.navigation.getParam('type')!;
    const settingsForType = getPushNotifsSettingsByType(this.props.timelineState)[type] || {};
    console.log('settingsForType', settingsForType);
    const defaultsForType = getDefaultPushNotifsSettingsByType(this.props.timelineState)[type] || {};
    console.log('defaultsForType', defaultsForType);
    let items = deepmerge<IPushNotifsSettings>(defaultsForType, settingsForType);
    const prefKeysArray = Object.keys(items);
    const pendingForType = Object.fromEntries(
      Object.entries(this.state.pendingPrefsChanges).filter(([k, v]) => prefKeysArray.includes(k)),
    );
    console.log('pendingForType', pendingForType);
    items = deepmerge<IPushNotifsSettings>(items, pendingForType);
    const areAllChecked = Object.values(items).every(v => v);
    console.log('areAllChecked', areAllChecked);
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
        ListFooterComponent={<View style={{ height: UI_SIZES.bottomInset }} />}
        ListHeaderComponent={
          hasEmptySubListData ? null : (
            <TouchableOpacity onPress={() => this.doTogglePushNotifSettingForAppType(type, !areAllChecked)}>
              <ListItem
                leftElement={<Text>{I18n.t('common.all')}</Text>}
                rightElement={
                  <Checkbox
                    customCheckboxColor={areAllChecked ? theme.color.text.light : undefined}
                    customContainerStyle={{
                      backgroundColor: theme.color.background.card,
                      borderColor: theme.color.text.light,
                      borderWidth: 2,
                    }}
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
          leftElement={<Text>{I18n.t(`timeline.notifType.${item[0]}`, {})}</Text>}
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

  // LIFECYCLE ====================================================================================

  componentDidMount() {
    this.doInit();
  }

  // METHODS ======================================================================================

  async doInit() {
    if (!this.props.navigation.getParam('type')) {
      try {
        this.setState({ loadingState: PushNotifsSettingsLoadingState.INIT });
        await this.props.handleInitPushNotifsSettings();
      } finally {
        this.setState({ loadingState: PushNotifsSettingsLoadingState.DONE });
      }
    } else {
      this.setState({ loadingState: PushNotifsSettingsLoadingState.DONE });
    }
  }

  async doTogglePushNotifSetting(item: [string, boolean]) {
    console.log('=== doTogglePushNotifSetting');
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
    const itemsWithNewValue = Object.fromEntries(Object.keys(items).map(k => [k, value]));
    this.setState({
      pendingPrefsChanges: {
        ...this.state.pendingPrefsChanges,
        ...itemsWithNewValue,
      },
    });
  }
}

// UTILS ==========================================================================================

const translateMainItem = (item: [string, IPushNotifsSettings]) => {
  const backupMissingTranslation = I18n.missingTranslation;
  I18n.missingTranslation = function (scope, options) {
    return undefined;
  };
  const t = I18n.t(`timeline.PushNotifsSettingsScreen.appType-override.${item[0]}`);
  I18n.missingTranslation = backupMissingTranslation;
  return t || I18n.t(`timeline.appType.${item[0]}`);
};

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => IPushNotifsSettingsScreenDataProps = s => {
  const timelineState = timelineModuleConfig.getState(s) as ITimeline_State;
  const session = getUserSession(s);
  return {
    timelineState,
    session,
  };
};

const mapDispatchToProps: (
  dispatch: ThunkDispatch<any, any, any>,
  getState: () => IGlobalState,
) => IPushNotifsSettingsScreenEventProps = (dispatch, getState) => ({
  handleInitPushNotifsSettings: async () => {
    await dispatch(loadPushNotifsSettingsAction());
  },
  handleUpdatePushNotifSettings: async (changes: IPushNotifsSettings) => {
    await dispatch(updatePushNotifsSettingsAction(changes));
  },
});

const PushNotifsSettingsScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(PushNotifsSettingsScreen);
export default withViewTracking('user/pushNotifsSettings')(PushNotifsSettingsScreen_Connected);
