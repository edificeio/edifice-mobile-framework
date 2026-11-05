import * as React from 'react';
import { ListRenderItemInfo, RefreshControl, TouchableOpacity, View } from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import theme from '~/app/theme';
import { genericHitSlop, UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/empty-screens';
import FlatList from '~/framework/components/list/flat-list';
import CustomBottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import NavBarActionsGroup from '~/framework/components/navigation/navbar-actions-group';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText, BodyText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { loadAuthorizedNotificationTypesAction } from '~/framework/modules/home/actions';
import {
  NotificationCard,
  NotificationsPlaceholder,
  PLACEHOLDER_NEXT_PAGE_CARDS,
  UserbookNotificationCard,
} from '~/framework/modules/home/components';
import { canOpenNotification, isUserbookNotification } from '~/framework/modules/home/components/notification/util';
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

const keyExtractor = (item: ITimelineNotification) => item.id;

const renderSeparator = () => <View style={styles.separator} />;

const renderEmpty = () => (
  <EmptyScreen
    svgImage="empty-timeline"
    title={I18n.get('user-sentnotifications-emptyscreen-title')}
    text={I18n.get('user-sentnotifications-emptyscreen-text')}
  />
);

const renderHeaderActions = (onPressInfo: () => void, onPressFilter: () => void) => () => (
  <NavBarActionsGroup
    elements={[
      <NavBarAction key="info" icon="ui-infoCircle" onPress={onPressInfo} testID="user-sentnotifications-info" />,
      <NavBarAction key="filter" icon="ui-filter" onPress={onPressFilter} testID="user-sentnotifications-filter" />,
    ]}
  />
);

export default function UserSentNotificationsScreen({ navigation }: Readonly<UserSentNotificationsScreenPrivateProps>) {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

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

  const renderItem = React.useCallback(
    ({ item }: ListRenderItemInfo<ITimelineNotification>) => {
      const onPress = canOpenNotification(item) ? () => onPressItem(item) : undefined;
      return (
        <View style={styles.row}>
          {isUserbookNotification(item) ? (
            <UserbookNotificationCard notification={item} onPress={onPress} />
          ) : (
            <NotificationCard notification={item} onPress={onPress} />
          )}
        </View>
      );
    },
    [onPressItem],
  );

  const refreshControl = React.useMemo(
    () => <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />,
    [onRefresh, refreshing],
  );

  const loadingOrRefreshing = loading || refreshing;

  function renderListEmpty() {
    if (loadingOrRefreshing) return <NotificationsPlaceholder preview={false} />;
    return renderEmpty();
  }

  function renderListFooter() {
    if (!loadingMore) return null;
    return <NotificationsPlaceholder count={PLACEHOLDER_NEXT_PAGE_CARDS} preview={false} />;
  }

  function renderList() {
    return (
      <FlatList
        style={UI_STYLES.flex1}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!loadingOrRefreshing}
        data={loadingOrRefreshing ? undefined : notifications}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={loadingOrRefreshing ? undefined : renderSeparator}
        contentContainerStyle={UI_STYLES.flexGrow1}
        ListEmptyComponent={renderListEmpty()}
        ListFooterComponent={renderListFooter()}
        refreshControl={refreshControl}
        onEndReached={onEndReached}
        onEndReachedThreshold={1}
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
