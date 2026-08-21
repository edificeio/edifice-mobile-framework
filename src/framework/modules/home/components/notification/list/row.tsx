import * as React from 'react';
import { View } from 'react-native';

import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SharedValue } from 'react-native-reanimated';

import { NotificationCard } from '~/framework/modules/home/components/notification/card';
import { isResourceUriNotification } from '~/framework/util/notifications';

import { getUserbookAuthor } from '../util';
import { ReportAction } from './report-action';
import styles, { REPORT_ACTION_WIDTH } from './styles';
import { NotificationRowProps } from './types';

// Lighter than the RNGH default (mass 2, damping 1000), just short of bouncing.
const SWIPE_ANIMATION_OPTIONS = { damping: 20, mass: 0.4, stiffness: 200 };

const CLOSE_DRAG_OFFSET = 10;
const NO_DRAG_OFFSET = 9999;

export const NotificationRow = React.memo(
  ({
    canReport,
    item,
    onClose,
    onPress,
    onRef,
    onReport,
    onSwipeActive,
    onWillOpen,
    opened,
    someRowOpen,
  }: NotificationRowProps) => {
    const opens = !!(isResourceUriNotification(item) || getUserbookAuthor(item));

    const setRef = React.useCallback((ref: SwipeableMethods | null) => onRef(item.id, ref), [item.id, onRef]);
    const press = React.useCallback(() => onPress(item, opens), [item, onPress, opens]);
    const report = React.useCallback(() => onReport(item), [item, onReport]);
    const willOpen = React.useCallback(() => onWillOpen(item.id), [item.id, onWillOpen]);
    const close = React.useCallback(() => onClose(item.id), [item.id, onClose]);
    const lockPager = React.useCallback(() => onSwipeActive(true), [onSwipeActive]);
    const unlockPager = React.useCallback(() => onSwipeActive(false), [onSwipeActive]);

    const renderRightActions = React.useCallback(
      (progress: SharedValue<number>) => <ReportAction progress={progress} onPress={report} />,
      [report],
    );

    // While a row is open, a tap anywhere serves to close it, even on a card that opens nothing.
    const card = <NotificationCard notification={item} onPress={opens || someRowOpen ? press : undefined} />;

    if (!canReport) return card;

    return (
      <ReanimatedSwipeable
        ref={setRef}
        renderRightActions={renderRightActions}
        rightThreshold={REPORT_ACTION_WIDTH / 2}
        overshootRight={false}
        overshootFriction={8}
        animationOptions={SWIPE_ANIMATION_OPTIONS}
        dragOffsetFromLeftEdge={opened ? CLOSE_DRAG_OFFSET : NO_DRAG_OFFSET}
        onSwipeableOpenStartDrag={lockPager}
        onSwipeableCloseStartDrag={lockPager}
        onSwipeableWillOpen={willOpen}
        // The pager is given back once the row settles, so the tab can still be changed.
        onSwipeableOpen={unlockPager}
        onSwipeableClose={close}>
        <View style={styles.row}>{card}</View>
      </ReanimatedSwipeable>
    );
  },
);
