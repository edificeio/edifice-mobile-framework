import * as React from 'react';
import { Alert, View } from 'react-native';

import { MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import { NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import { UI_STYLES } from '~/framework/components/constants';
import { BodyText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { withSession } from '~/framework/modules/auth/util';
import {
  deleteNotificationAction,
  loadNotificationsPageAction,
  startLoadNotificationsAction,
} from '~/framework/modules/home/actions';
import { NotificationList } from '~/framework/modules/home/components';
import { isUserbookNotification } from '~/framework/modules/home/components/notification/util';
import { useHomeReload, useRefresh } from '~/framework/modules/home/hooks';
import timelineConfig from '~/framework/modules/home/module-config';
import { notificationsService } from '~/framework/modules/home/service';
import { getTimelineWorkflowInformation } from '~/framework/modules/timeline/rights';
import { userRouteNames } from '~/framework/modules/user/navigation';
import { ModalsRouteNames } from '~/framework/navigation/modals';
import type { ITimelineNotification } from '~/framework/util/notifications';
import { defaultNotificationActionStack, handleNotificationAction } from '~/framework/util/notifications/routing';

import styles from './styles';
import { HomeNotificationsScreenProps } from './types';

// ToDo: bring back the badge of the unread count once the back exposes.
export const HomeNotificationsScreenOptions = (): MaterialTopTabNavigationOptions => ({
  tabBarButtonTestID: 'home-tab-notifications',
  title: I18n.get('home-notifications-title'),
});

export const HomeNotificationsScreen = withSession<HomeNotificationsScreenProps>(function ({ navigation, session }) {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const navParent = navigation.getParent<NavigationProp<ParamListBase>>();

  const notifications = useSelector(state => timelineConfig.getState(state).notifications);
  const canReport = getTimelineWorkflowInformation(session).notification.report;

  const onEndReached = React.useCallback(() => {
    if (!notifications.endReached) dispatch(loadNotificationsPageAction());
  }, [dispatch, notifications.endReached]);

  const reload = React.useCallback(() => dispatch(startLoadNotificationsAction()), [dispatch]);

  const reloading = useHomeReload(reload);

  const filterSettings = useSelector(state => timelineConfig.getState(state).notifSettings.notifFilterSettings.data);
  const knownFilterSettings = React.useRef(filterSettings);

  const [applyingFilters, setApplyingFilters] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (knownFilterSettings.current === filterSettings) return;
    knownFilterSettings.current = filterSettings;

    setApplyingFilters(true);
    reload().finally(() => setApplyingFilters(false));
  }, [filterSettings, reload]);

  const { onRefresh, refreshing } = useRefresh(reload);

  const onPressItem = React.useCallback(
    (notification: ITimelineNotification) => {
      if (isUserbookNotification(notification)) {
        return navParent.navigate(userRouteNames.profile, { userId: notification.backupData?.sender });
      }

      dispatch(
        handleNotificationAction(
          notification,
          defaultNotificationActionStack,
          navParent,
          navParent.dispatch,
          'Home Notification',
          false,
        ),
      );
    },
    [dispatch, navParent],
  );

  const pagerLocked = React.useRef<boolean>(false);
  const onRowSwipeActiveChange = React.useCallback(
    (active: boolean) => {
      if (pagerLocked.current === active) return;
      pagerLocked.current = active;
      navigation.setOptions({ swipeEnabled: !active } as MaterialTopTabNavigationOptions);
    },
    [navigation],
  );

  useFocusEffect(React.useCallback(() => () => onRowSwipeActiveChange(false), [onRowSwipeActiveChange]));

  const onDeleteItem = React.useCallback(
    (id: string) =>
      new Promise<void>(resolve => {
        Alert.alert(I18n.get('home-notifications-delete-title'), I18n.get('home-notifications-delete-description'), [
          {
            onPress: async () => {
              try {
                await dispatch(deleteNotificationAction(id));
              } catch {
                Toast.showError(I18n.get('timeline-error-text'));
              } finally {
                resolve();
              }
            },
            style: 'destructive',
            text: I18n.get('common-delete'),
          },
          { onPress: () => resolve(), style: 'cancel', text: I18n.get('common-cancel') },
        ]);
      }),
    [dispatch],
  );

  const onReportItem = React.useCallback(
    (notification: ITimelineNotification) =>
      new Promise<boolean>((resolve, reject) => {
        Alert.alert(
          I18n.get('timeline-reportaction-title'),
          I18n.get('timeline-reportaction-description', { appName: DeviceInfo.getApplicationName() }),
          [
            {
              onPress: async () => {
                try {
                  await notificationsService.report(notification.id);
                  Toast.showSuccess(I18n.get('timeline-reportaction-success'));
                  resolve(true);
                } catch (e) {
                  Alert.alert(I18n.get('timeline-error-text'));
                  reject(e);
                }
              },
              style: 'destructive',
              text: I18n.get('timeline-reportaction-submit'),
            },
            { onPress: () => resolve(false), style: 'cancel', text: I18n.get('common-cancel') },
          ],
        );
      }),
    [],
  );

  const openFilters = React.useCallback(() => navParent.navigate(ModalsRouteNames.NotificationFilters), [navParent]);

  const isListLoading = notifications.isPristine || reloading || applyingFilters;

  const isLoadingNextPage = notifications.isFetching && !refreshing && !isListLoading;

  return (
    <View style={UI_STYLES.flex1}>
      <View style={styles.filterBar}>
        <DefaultButton
          action={openFilters}
          text={I18n.get('home-notifications-filter')}
          TextComponent={BodyText}
          contentColor={theme.palette.grey.black}
          iconLeft="ui-filter"
          iconRight="ui-rafterDown"
          style={styles.filterButton}
          testID="home-notifications-filter"
        />
      </View>
      <NotificationList
        notifications={notifications.data}
        loading={isListLoading}
        loadingMore={isLoadingNextPage}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={onEndReached}
        onDeleteItem={onDeleteItem}
        onPressItem={onPressItem}
        onReportItem={onReportItem}
        onSwipeActiveChange={onRowSwipeActiveChange}
        canReport={canReport}
        userId={session.user.id}
      />
    </View>
  );
});
