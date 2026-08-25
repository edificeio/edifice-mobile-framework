import * as React from 'react';
import { View } from 'react-native';

import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SharedValue } from 'react-native-reanimated';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { NotificationCard, UserbookNotificationCard } from '~/framework/modules/home/components/notification/card';

import { canOpenNotification, isUserbookNotification } from '../util';
import styles, { ACTION_WIDTH } from './styles';
import { SwipeAction } from './swipe-action';
import { NotificationRowProps } from './types';

const SWIPE_ANIMATION_OPTIONS = { damping: 20, mass: 0.4, stiffness: 200 };

const CLOSE_DRAG_OFFSET = 10;
const NO_DRAG_OFFSET = 9999;

export const NotificationRow = React.memo(
  ({
    canReport,
    isRowOpened,
    item,
    onClose,
    onDelete,
    onOpen,
    onPress,
    onRef,
    onReport,
    onSwipeActive,
    onWillOpen,
    someRowOpen,
  }: NotificationRowProps) => {
    const isOpenable = canOpenNotification(item);

    const setRef = React.useCallback((ref: SwipeableMethods | null) => onRef(item.id, ref), [item.id, onRef]);
    const handleCardPress = React.useCallback(() => onPress(item), [item, onPress]);
    const report = React.useCallback(() => onReport(item), [item, onReport]);
    const remove = React.useCallback(() => onDelete(item.id), [item.id, onDelete]);
    const willOpen = React.useCallback(() => onWillOpen(item.id), [item.id, onWillOpen]);
    const openSwipeable = React.useCallback(() => onOpen(item.id), [item.id, onOpen]);
    const closeSwipeable = React.useCallback(() => onClose(item.id), [item.id, onClose]);
    const lockPager = React.useCallback(() => onSwipeActive(true), [onSwipeActive]);

    const onOpened = React.useCallback(() => {
      onSwipeActive(false);
      openSwipeable();
    }, [onSwipeActive, openSwipeable]);

    const renderRightActions = React.useCallback(
      (progress: SharedValue<number>) => (
        <View style={styles.actions}>
          {canReport ? (
            <SwipeAction
              color={theme.palette.secondary.dark}
              icon="ui-alert-triangle"
              label={I18n.get('timeline-reportaction-button')}
              onPress={report}
              progress={progress}
            />
          ) : null}
          <SwipeAction
            color={theme.palette.status.failure.regular}
            filled
            icon="ui-delete"
            label={I18n.get('common-delete')}
            onPress={remove}
            progress={progress}
          />
        </View>
      ),
      [canReport, remove, report],
    );

    const onCardPress = isOpenable || someRowOpen ? handleCardPress : undefined;
    const card = isUserbookNotification(item) ? (
      <UserbookNotificationCard notification={item} onPress={onCardPress} />
    ) : (
      <NotificationCard notification={item} onPress={onCardPress} />
    );

    return (
      <ReanimatedSwipeable
        ref={setRef}
        renderRightActions={renderRightActions}
        rightThreshold={((canReport ? 2 : 1) * ACTION_WIDTH) / 2}
        overshootRight={false}
        overshootFriction={8}
        animationOptions={SWIPE_ANIMATION_OPTIONS}
        dragOffsetFromLeftEdge={isRowOpened ? CLOSE_DRAG_OFFSET : NO_DRAG_OFFSET}
        onSwipeableOpenStartDrag={lockPager}
        onSwipeableCloseStartDrag={lockPager}
        onSwipeableWillOpen={willOpen}
        onSwipeableOpen={onOpened}
        onSwipeableClose={closeSwipeable}>
        <View style={styles.row}>{card}</View>
      </ReanimatedSwipeable>
    );
  },
);
