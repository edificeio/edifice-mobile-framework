import * as React from 'react';
import { View } from 'react-native';

import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SharedValue } from 'react-native-reanimated';

import { ACTION_WIDTH, SwipeAction } from '~/framework/components/list/swipeable/row/action';

import styles from './styles';
import { SwipeRowAction, SwipeRowProps } from './types';

const SWIPE_ANIMATION_OPTIONS = { damping: 20, mass: 0.4, stiffness: 200 };

// a closed row ignores right drags, an open one closes with a short right drag.
const CLOSE_DRAG_OFFSET = 10;
const NO_DRAG_OFFSET = 9999;

const NO_ACTIONS: readonly SwipeRowAction[] = [];

function SwipeRow<ItemT>({
  getSwipeActions,
  guardPress,
  id,
  index,
  isRowOpened,
  item,
  onClose,
  onOpen,
  onRef,
  onSwipeActive,
  onWillOpen,
  renderItem,
}: Readonly<SwipeRowProps<ItemT>>) {
  const swipeable = React.useRef<SwipeableMethods | null>(null);

  const setRef = React.useCallback(
    (ref: SwipeableMethods | null) => {
      swipeable.current = ref;
      onRef(id, ref);
    },
    [id, onRef],
  );
  const willOpen = React.useCallback(() => onWillOpen(id), [id, onWillOpen]);
  const closeSwipeable = React.useCallback(() => onClose(id), [id, onClose]);
  const lockPager = React.useCallback(() => onSwipeActive(true), [onSwipeActive]);

  const onOpened = React.useCallback(() => {
    onSwipeActive(false);
    onOpen(id);
  }, [id, onOpen, onSwipeActive]);

  // the row closes once the action is done, whatever its outcome.
  const actions = React.useMemo(
    () =>
      (getSwipeActions?.(item) ?? NO_ACTIONS).map(action => ({
        ...action,
        onPress: async () => {
          try {
            await action.onPress();
          } finally {
            swipeable.current?.close();
          }
        },
      })),
    [getSwipeActions, item],
  );

  const content = React.useMemo(() => renderItem({ guardPress, index, item }), [guardPress, index, item, renderItem]);

  const renderRightActions = React.useCallback(
    (progress: SharedValue<number>) => (
      <View style={styles.actions}>
        {actions.map(action => (
          <SwipeAction
            key={action.testID ?? action.label}
            color={action.color}
            filled={action.filled}
            icon={action.icon}
            label={action.label}
            onPress={action.onPress}
            progress={progress}
            testID={action.testID}
          />
        ))}
      </View>
    ),
    [actions],
  );

  const row = <View style={styles.row}>{content}</View>;

  // a row without actions stays a plain view, so nothing catches the taps.
  if (!actions.length) return row;

  return (
    <ReanimatedSwipeable
      ref={setRef}
      renderRightActions={renderRightActions}
      rightThreshold={(actions.length * ACTION_WIDTH) / 2}
      overshootRight={false}
      overshootFriction={8}
      animationOptions={SWIPE_ANIMATION_OPTIONS}
      dragOffsetFromLeftEdge={isRowOpened ? CLOSE_DRAG_OFFSET : NO_DRAG_OFFSET}
      onSwipeableOpenStartDrag={lockPager}
      onSwipeableCloseStartDrag={lockPager}
      onSwipeableWillOpen={willOpen}
      onSwipeableOpen={onOpened}
      onSwipeableClose={closeSwipeable}>
      {row}
    </ReanimatedSwipeable>
  );
}

// only the row whose open state changes renders again.
export default React.memo(SwipeRow) as typeof SwipeRow;
