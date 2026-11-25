import * as React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';

import { useDispatch } from 'react-redux';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import { AppDispatch } from '~/app/store';
import theme from '~/app/theme';
import { genericHitSlop, UI_SIZES } from '~/framework/components/constants';
import EmptyErrorScreen from '~/framework/components/empty-screens/error/component';
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
import { getSentNotificationsFilters, setSentNotificationsFilters } from '~/framework/modules/home/storage';
import type { NotificationFilterSelection } from '~/framework/modules/home/templates/notification-filters';
import { userRouteNames } from '~/framework/modules/user/navigation';
import type { ITimelineNotification } from '~/framework/util/notifications';
import { defaultNotificationActionStack, handleNotificationAction } from '~/framework/util/notifications/routing';

import styles from './styles';
import type { HomeSentNotificationsScreen } from './types';

// the server sends pages of 25: a shorter page is the last one.
const PAGE_SIZE = 25;

export const HomeSentNotificationsScreenOptions = screenOptions(() => ({
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

export default function HomeSentNotificationsScreen({ navigation, route }: Readonly<HomeSentNotificationsScreen.AllProps>) {
  const dispatch = useDispatch<AppDispatch>();

  const [notifications, setNotifications] = React.useState<ITimelineNotification[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadingMore, setLoadingMore] = React.useState<boolean>(false);
  const [loadFailed, setLoadFailed] = React.useState<boolean>(false);

  // read when a reload fails, without making the reload depend on the list.
  const hasNotifications = React.useRef<boolean>(false);
  React.useEffect(() => {
    hasNotifications.current = notifications.length > 0;
  }, [notifications]);

  // kept in refs so that a page asked twice by onEndReached is only fetched once.
  const nextPage = React.useRef<number>(0);
  const endReached = React.useRef<boolean>(false);
  const fetching = React.useRef<boolean>(false);
  // bumped by each reload, so that a page asked before it is dropped when it lands.
  const loadId = React.useRef<number>(0);

  // unset until the notification types are loaded.
  const [selection, setSelection] = React.useState<NotificationFilterSelection | null>(null);

  // the types are loaded once: a page then only asks for its notifications.
  const loadSelection = React.useCallback(async () => {
    try {
      const authorizedTypes = await dispatch(loadAuthorizedNotificationTypesAction());
      setSelection(getSentNotificationsFilters(authorizedTypes));
    } catch (e) {
      console.error('Error while loading the notification types', e);
      setLoadFailed(true);
      setLoading(false);
    }
  }, [dispatch]);

  React.useEffect(() => {
    loadSelection();
  }, [loadSelection]);

  const savedSelection = route.params?.selection;
  React.useEffect(() => {
    if (!savedSelection) return;
    setSentNotificationsFilters(savedSelection);
    setSelection(savedSelection);
  }, [savedSelection]);

  const fetchPage = React.useCallback(
    (page: number) => {
      const types = Object.keys(selection ?? {}).filter(type => selection?.[type]);
      return notificationsService.sentPage(page, types);
    },
    [selection],
  );

  const reload = React.useCallback(async () => {
    loadId.current += 1;
    const id = loadId.current;
    fetching.current = true;
    try {
      const pageNotifications = await fetchPage(0);
      if (id !== loadId.current) return;
      nextPage.current = 1;
      endReached.current = pageNotifications.length < PAGE_SIZE;
      setNotifications(pageNotifications);
      setLoadFailed(false);
    } catch (e) {
      if (id !== loadId.current) return;
      // a failed reload keeps the list already shown
      console.error('Error while loading the sent notifications', e);
      setLoadFailed(true);
      if (hasNotifications.current) Toast.showError(I18n.get('timeline-error-text'));
    } finally {
      if (id === loadId.current) fetching.current = false;
    }
  }, [fetchPage]);

  const restartLoading = React.useCallback(() => {
    setLoading(true);
    // a newer reload still on its way ends the loading itself.
    reload().finally(() => {
      if (!fetching.current) setLoading(false);
    });
  }, [reload]);

  // the first page, then a new one each time the selection changes.
  React.useEffect(() => {
    if (selection) restartLoading();
  }, [restartLoading, selection]);

  const retry = React.useCallback(() => {
    if (selection) return restartLoading();
    setLoading(true);
    loadSelection();
  }, [loadSelection, restartLoading, selection]);

  const { onRefresh, refreshing } = useRefresh(reload);

  const infoRef = React.useRef<BottomSheetModalMethods>(null);
  const closeInfo = React.useCallback(() => infoRef.current?.dismiss(), []);

  const openInfo = React.useCallback(() => infoRef.current?.present(), []);
  const openFilters = React.useCallback(
    () => navigation.navigate(userRouteNames.sentNotificationsFilters, { selection: selection ?? undefined }),
    [navigation, selection],
  );

  React.useEffect(() => {
    navigation.setOptions({ headerRight: renderHeaderActions(openInfo, openFilters) });
  }, [navigation, openFilters, openInfo]);

  const onEndReached = React.useCallback(async () => {
    if (fetching.current || endReached.current || loading) return;
    const id = loadId.current;
    const page = nextPage.current;
    fetching.current = true;
    setLoadingMore(true);
    try {
      const pageNotifications = await fetchPage(page);
      if (id !== loadId.current) return;
      nextPage.current = page + 1;
      endReached.current = pageNotifications.length < PAGE_SIZE;
      setNotifications(current => [...current, ...pageNotifications]);
    } catch (e) {
      if (id !== loadId.current) return;
      // the same page is asked again on the next scroll.
      console.error('Error while loading the next page of sent notifications', e);
      Toast.showError(I18n.get('timeline-error-text'));
    } finally {
      if (id === loadId.current) fetching.current = false;
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
    // with nothing loaded, the empty list would tell the user they sent nothing.
    if (loadFailed && !loading && !notifications.length) return <EmptyErrorScreen onRetry={retry} />;
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
