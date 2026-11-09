import * as React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';

import { useDispatch, useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import { AppDispatch } from '~/app/store';
import theme from '~/app/theme';
import { genericHitSlop, UI_SIZES } from '~/framework/components/constants';
import type { SwipeRowAction } from '~/framework/components/list/swipeable';
import CustomBottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import NavBarActionsGroup from '~/framework/components/navigation/navbar-actions-group';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText, BodyText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { loadAuthorizedNotificationTypesAction } from '~/framework/modules/home/actions';
import { NotificationList } from '~/framework/modules/home/components/notification/list';
import { isUserbookNotification } from '~/framework/modules/home/components/notification/util';
import { useRefresh } from '~/framework/modules/home/hooks';
import { notificationsService } from '~/framework/modules/home/service';
import { loadSentNotificationFiltersAction } from '~/framework/modules/user/actions';
import { userRouteNames } from '~/framework/modules/user/navigation';
import { userSelectors } from '~/framework/modules/user/reducer';
import type { ITimelineNotification } from '~/framework/util/notifications';
import { defaultNotificationActionStack, handleNotificationAction } from '~/framework/util/notifications/routing';

import styles from './styles';
import type { UserSentNotificationsScreenPrivateProps } from './types';

// the server sends pages of 25: a shorter page is the last one.
const PAGE_SIZE = 25;

export const computeNavBar = screenOptions(() => ({
  title: I18n.get('user-sentnotifications-title'),
}));

const EMPTY_TEXTS_I18N = { text: 'user-sentnotifications-emptyscreen-text', title: 'user-sentnotifications-emptyscreen-title' };

const renderHeaderActions = (onPressInfo: () => void, onPressFilter: () => void) => () => (
  <NavBarActionsGroup
    elements={[
      <NavBarAction key="info" icon="ui-infoCircle" onPress={onPressInfo} testID="user-sentnotifications-info" />,
      <NavBarAction key="filter" icon="ui-filter" onPress={onPressFilter} testID="user-sentnotifications-filter" />,
    ]}
  />
);

export default function UserSentNotificationsScreen({ navigation }: Readonly<UserSentNotificationsScreenPrivateProps>) {
  const dispatch = useDispatch<AppDispatch>();

  const [notifications, setNotifications] = React.useState<ITimelineNotification[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadingMore, setLoadingMore] = React.useState<boolean>(false);

  // kept in refs so that a page asked twice by onEndReached is only fetched once.
  const nextPage = React.useRef<number>(0);
  const endReached = React.useRef<boolean>(false);
  const fetching = React.useRef<boolean>(false);

  const sentNotificationFilters = useSelector(userSelectors.getSentNotificationFilters);
  const appliedFilters = React.useRef<Record<string, boolean> | null>(null);

  const fetchPage = React.useCallback(
    async (page: number) => {
      const authorizedTypes = await dispatch(loadAuthorizedNotificationTypesAction());
      const filters = dispatch(loadSentNotificationFiltersAction(authorizedTypes));
      if (page === 0) appliedFilters.current = filters;
      const types = authorizedTypes.filter(type => filters[type] !== false);
      const pageNotifications = await notificationsService.sentPage(page, types);
      nextPage.current = page + 1;
      endReached.current = pageNotifications.length < PAGE_SIZE;
      return pageNotifications;
    },
    [dispatch],
  );

  const reload = React.useCallback(async () => {
    // a page already on its way would land after the reloaded list: skip, the next pull reloads.
    if (fetching.current) return;
    fetching.current = true;
    try {
      setNotifications(await fetchPage(0));
    } catch (e) {
      // a failed reload keeps the list already shown.
      console.error('Error while loading the sent notifications', e);
      Toast.showError(I18n.get('timeline-error-text'));
    } finally {
      fetching.current = false;
    }
  }, [fetchPage]);

  React.useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  React.useEffect(() => {
    if (!sentNotificationFilters || appliedFilters.current === null || sentNotificationFilters === appliedFilters.current) return;
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, [reload, sentNotificationFilters]);

  const { onRefresh, refreshing } = useRefresh(reload);

  const infoRef = React.useRef<BottomSheetModalMethods>(null);
  const closeInfo = React.useCallback(() => infoRef.current?.dismiss(), []);

  const openInfo = React.useCallback(() => infoRef.current?.present(), []);
  const openFilters = React.useCallback(() => navigation.navigate(userRouteNames.sentNotificationsFilters, {}), [navigation]);

  React.useEffect(() => {
    navigation.setOptions({ headerRight: renderHeaderActions(openInfo, openFilters) });
  }, [navigation, openFilters, openInfo]);

  const onEndReached = React.useCallback(async () => {
    if (fetching.current || endReached.current || loading) return;
    fetching.current = true;
    setLoadingMore(true);
    try {
      const pageNotifications = await fetchPage(nextPage.current);
      setNotifications(current => [...current, ...pageNotifications]);
    } catch (e) {
      // the same page is asked again on the next scroll.
      console.error('Error while loading the next page of sent notifications', e);
      Toast.showError(I18n.get('timeline-error-text'));
    } finally {
      fetching.current = false;
      setLoadingMore(false);
    }
  }, [fetchPage, loading]);

  const onPressItem = React.useCallback(
    (notification: ITimelineNotification) => {
      if (isUserbookNotification(notification)) {
        return navigation.navigate(userRouteNames.profile, { userId: notification.backupData?.sender });
      }
      dispatch(
        handleNotificationAction(
          notification,
          defaultNotificationActionStack,
          navigation,
          navigation.dispatch,
          'Sent Notification',
          false,
        ),
      );
    },
    [dispatch, navigation],
  );

  const deleteNotification = React.useCallback(async (id: string) => {
    setNotifications(current => current.map(item => (item.id === id ? { ...item, deleted: true } : item)));
    try {
      await notificationsService.deleteSent(id);
      setNotifications(current => current.filter(item => item.id !== id));
      Toast.showSuccess(I18n.get('user-sentnotifications-delete-success'));
    } catch (e) {
      console.error('Error while deleting a sent notification', e);
      setNotifications(current => current.map(item => (item.id === id ? { ...item, deleted: false } : item)));
      Toast.showError(I18n.get('timeline-error-text'));
    }
  }, []);

  const confirmDelete = React.useCallback(
    (id: string) =>
      new Promise<void>(resolve => {
        Alert.alert(I18n.get('user-sentnotifications-delete-title'), I18n.get('user-sentnotifications-delete-description'), [
          { onPress: () => resolve(), style: 'cancel', text: I18n.get('common-cancel') },
          {
            onPress: () => deleteNotification(id).finally(resolve),
            style: 'destructive',
            text: I18n.get('common-delete'),
          },
        ]);
      }),
    [deleteNotification],
  );

  const getSwipeActions = React.useCallback(
    (notification: ITimelineNotification): SwipeRowAction[] => [
      {
        color: theme.palette.status.failure.regular,
        filled: true,
        icon: 'ui-delete',
        label: I18n.get('common-delete'),
        onPress: () => confirmDelete(notification.id),
        testID: 'user-sentnotifications-delete',
      },
    ],
    [confirmDelete],
  );

  function renderList() {
    return (
      <NotificationList
        notifications={notifications}
        loading={loading}
        loadingMore={loadingMore}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={onEndReached}
        onPressItem={onPressItem}
        getSwipeActions={getSwipeActions}
        emptyTextsI18n={EMPTY_TEXTS_I18N}
      />
    );
  }

  function renderInfoHeader() {
    return (
      <View style={styles.infoHeader}>
        <TouchableOpacity onPress={closeInfo} hitSlop={genericHitSlop} testID="user-sentnotifications-info-close">
          <Svg
            name="ui-check"
            width={UI_SIZES.elements.icon.default}
            height={UI_SIZES.elements.icon.default}
            fill={theme.palette.grey.black}
          />
        </TouchableOpacity>
      </View>
    );
  }

  function renderInfoBottomSheet() {
    return (
      <CustomBottomSheetModal ref={infoRef} gutters={false} handleIndicatorStyle={styles.infoHandle} header={renderInfoHeader()}>
        <View style={styles.infoBody}>
          <BodyBoldText style={styles.infoTitle}>{I18n.get('user-sentnotifications-info-title')}</BodyBoldText>
          <BodyText>{I18n.get('user-sentnotifications-info-text')}</BodyText>
        </View>
      </CustomBottomSheetModal>
    );
  }

  return (
    <>
      {renderList()}
      {renderInfoBottomSheet()}
    </>
  );
}
