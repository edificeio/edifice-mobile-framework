import * as React from 'react';
import { View } from 'react-native';

import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SharedValue } from 'react-native-reanimated';

import { useSwipeRows } from '~/framework/components/list/swipeable/context';
import { ACTION_WIDTH, SwipeAction } from '~/framework/components/list/swipeable/row/action';

import styles from './styles';
import { SwipeRowAction, SwipeRowProps } from './types';

const SWIPE_ANIMATION_OPTIONS = { damping: 20, mass: 0.4, stiffness: 200 };

// a closed row ignores right drags, an open one closes with a short right drag.
const CLOSE_DRAG_OFFSET = 10;
const NO_DRAG_OFFSET = 9999;

const NO_ACTIONS: readonly SwipeRowAction[] = [];

const SwipeRow = <ItemT,>({
  extraData,
  getSwipeActions,
  id,
  index,
  isRowOpened,
  item,
  renderItem,
  target,
}: Readonly<SwipeRowProps<ItemT>>) => {
  const { closeOpenedRow, hasOpenedRow, onRowClosed, onRowOpened, onRowWillOpen, onSwipeActive, registerRow } = useSwipeRows();
  const swipeableRef = React.useRef<SwipeableMethods | null>(null);

  // a recycled row starts closed.
  React.useLayoutEffect(() => {
    swipeableRef.current?.reset();
  }, [id]);

  const setRef = React.useCallback(
    (ref: SwipeableMethods | null) => {
      swipeableRef.current = ref;
      registerRow(id, ref);
    },
    [id, registerRow],
  );
  const willOpen = React.useCallback(() => onRowWillOpen(id), [id, onRowWillOpen]);
  const closeSwipeable = React.useCallback(() => onRowClosed(id), [id, onRowClosed]);
  const lockPager = React.useCallback(() => onSwipeActive(true), [onSwipeActive]);

  const onOpened = React.useCallback(() => {
    onSwipeActive(false);
    onRowOpened(id);
  }, [id, onRowOpened, onSwipeActive]);

  // the row closes once the action is done, whatever its outcome.
  const actions = React.useMemo(
    () =>
      (getSwipeActions?.(item) ?? NO_ACTIONS).map(action => ({
        ...action,
        onPress: async () => {
          try {
            await action.onPress();
          } finally {
            swipeableRef.current?.close();
          }
        },
      })),
    [getSwipeActions, item],
  );

  // built here from props, so that this row does not render again when another one opens.
  const content = React.useMemo(() => renderItem({ extraData, index, item, target }), [extraData, index, item, renderItem, target]);

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

  // a tap first puts back the row left open, wherever it lands, and opens nothing.
  // the swipe actions sit outside this view, so they still get their taps.
  const row = (
    <View style={styles.row} onStartShouldSetResponderCapture={hasOpenedRow} onResponderRelease={closeOpenedRow}>
      {content}
    </View>
  );

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
};

// only the row whose open state changes renders again.
// the cast keeps ItemT: React.memo returns a component that is no longer generic.
export default React.memo(SwipeRow) as typeof SwipeRow;
