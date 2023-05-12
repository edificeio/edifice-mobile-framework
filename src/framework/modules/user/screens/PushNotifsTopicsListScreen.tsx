/**
 * Index page for push-notifs settings.
 */
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import deepmerge from 'deepmerge';
import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen } from '~/framework/components/emptyConnectionScreen';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { ListItem } from '~/framework/components/listItem';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { Icon } from '~/framework/components/picture';
import { SmallActionText, SmallText, TextSizeStyle } from '~/framework/components/text';
import { ISession } from '~/framework/modules//auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { loadPushNotifsSettingsAction } from '~/framework/modules/timeline/actions/notifSettings';
import timelineModuleConfig from '~/framework/modules/timeline/module-config';
import {
  IPushNotifsSettingsByType,
  TimelineState,
  getDefaultPushNotifsSettingsByType,
  getPushNotifsSettingsByType,
} from '~/framework/modules/timeline/reducer';
import { IPushNotifsSettings } from '~/framework/modules/timeline/reducer/notifSettings/pushNotifsSettings';
import moduleConfig from '~/framework/modules/user/module-config';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import Notifier from '~/framework/util/notifier';

export interface IPushNotifsTopicsListScreenDataProps {
  timelineState: TimelineState;
  session: ISession;
}

export interface IPushNotifsTopicsListScreenEventProps {
  handleInitPushNotifsSettings(): Promise<void>;
}

export interface IPushNotifsTopicsListScreenNavigationParams {}

export type IPushNotifsTopicsListScreenProps = IPushNotifsTopicsListScreenDataProps &
  IPushNotifsTopicsListScreenEventProps &
  NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.notifPrefs>;

export enum PushNotifsTopicsListLoadingState {
  PRISTINE,
  INIT,
  DONE,
  UPDATE,
}

export interface IPushNotifsTopicsListScreenState {
  loadingState: PushNotifsTopicsListLoadingState; // Holds the initial loading state. further page loading is handled by async.isFetching
}

const styles = StyleSheet.create({
  iconItem: {
    flex: 0,
    marginLeft: UI_SIZES.spacing.big,
    transform: [{ rotate: '270deg' }],
  },
  item: {
    flexDirection: 'row',
  },
});

const translateMainItem = (item: [string, IPushNotifsSettings]) => {
  const backupMissingTranslation = I18n.missingTranslation;
  I18n.missingTranslation = function (scope, options) {
    return undefined;
  };
  const t = I18n.t(`timeline.PushNotifsSettingsScreen.appType-override.${item[0]}`);
  I18n.missingTranslation = backupMissingTranslation;
  return t || I18n.t(`timeline.appType.${item[0]}`);
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.notifPrefs>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.t('directory-notificationsTitle'),
  }),
});

export class PushNotifsTopicsListScreen extends React.PureComponent<
  IPushNotifsTopicsListScreenProps,
  IPushNotifsTopicsListScreenState
> {
  state: IPushNotifsTopicsListScreenState = {
    loadingState: PushNotifsTopicsListLoadingState.PRISTINE,
  };

  render() {
    const { timelineState } = this.props;
    const { loadingState } = this.state;
    const settings = timelineState.notifSettings.pushNotifsSettings;
    return (
      <PageView>
        <Notifier id="timeline/push-notifications" />
        {[PushNotifsTopicsListLoadingState.PRISTINE, PushNotifsTopicsListLoadingState.INIT].includes(loadingState) ? (
          <LoadingIndicator />
        ) : settings.error && !settings.lastSuccess ? (
          this.renderError()
        ) : (
          this.renderMainList()
        )}
      </PageView>
    );
  }

  renderMainList() {
    const settings = getPushNotifsSettingsByType(this.props.timelineState);
    const defaults = getDefaultPushNotifsSettingsByType(this.props.timelineState);
    let items = deepmerge<IPushNotifsSettingsByType>(defaults, settings);
    items = Object.fromEntries(
      Object.entries(items).filter(item => {
        const notifFilter = this.props.timelineState.notifDefinitions.notifFilters.data.find(tf => tf.type === item[0]);
        return this.props.session.apps.find(app => !app.name || app.name === notifFilter?.['app-name']);
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
        overScrollMode="never"
        ListFooterComponent={<View style={{ height: UI_SIZES.screen.bottomInset }} />}
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
          this.props.navigation.navigate(userRouteNames.notifPrefsDetails, { type: item[0] });
        }}>
        <ListItem
          leftElement={<SmallText>{translateMainItem(item)}</SmallText>}
          rightElement={
            <View style={styles.item}>
              <SmallActionText style={{ ...TextSizeStyle.Small }}>
                {I18n.t(`user.pushNotifsSettingsScreen.countOutOfTotal`, {
                  count: totalOn,
                  total,
                })}
              </SmallActionText>
              <Icon name="arrow_down" color={theme.palette.primary.regular} style={styles.iconItem} />
            </View>
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
    try {
      this.setState({ loadingState: PushNotifsTopicsListLoadingState.INIT });
      await this.props.handleInitPushNotifsSettings();
    } finally {
      this.setState({ loadingState: PushNotifsTopicsListLoadingState.DONE });
    }
  }
}

const mapStateToProps: (s: IGlobalState) => IPushNotifsTopicsListScreenDataProps = s => {
  const timelineState = timelineModuleConfig.getState(s) as TimelineState;
  const session = getSession()!;
  return {
    timelineState,
    session,
  };
};

const mapDispatchToProps: (
  dispatch: ThunkDispatch<any, any, any>,
  getState: () => IGlobalState,
) => IPushNotifsTopicsListScreenEventProps = (dispatch, getState) => ({
  handleInitPushNotifsSettings: async () => {
    await dispatch(loadPushNotifsSettingsAction());
  },
});

const PushNotifsSettingsScreenConnected = connect(mapStateToProps, mapDispatchToProps)(PushNotifsTopicsListScreen);
export default PushNotifsSettingsScreenConnected;
