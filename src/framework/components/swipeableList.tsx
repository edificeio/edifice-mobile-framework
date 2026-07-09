/**
 * Renders a FlatList with swipeable elements.
 * Gestures are recognized to automatically unswipe the selected elements whe other touches are involved.
 * Based on npm mobile `react-native-swipe-list-view`
 *
 * Usage :
 * - Same props as FlatList
 * - Same props as SwipeListView
 * - swipeActionWidth in px is mandatory
 * - additional `itemSwipeActionProps`, works like `renderItem` prop and returns specific Swipeable props for of each list item.
 * - custom styles (see example below)
 *
 * CAUTION ! your data must include a `key` property for each item !
 *
 * Example :
 * const listRef = React.createRef<SwipeableListHandle<IItemType>>();
 * <SwipeableList
 *     data={data}
 *     swipeActionWidth={140} // Width of one action button in px
 *     // every props exposed from react-native-swipe-list-view
 *     itemSwipeActionProps={({ item }) => ({
 *       left: [],
 *       right : [{
 *         action: async row => {
 *           Alert.alert(item.text);
 *           row[item.key]?.closeRow(); // recenter after action tapped
 *         },
 *         actionColor: theme.palette.status.warning.regular,
 *         actionText: I18n.get('timeline-reportaction-button'),
 *         actionIcon: 'ui-answer',
 *       }],
 *     })}
 *     hiddenRowStyle={{margin: 10}} // Optional. styles for the row wrapper
 *     hiddenItemStyle={UI_STYLES.justifyEnd} // Optional. style for every action
 * />
 */
import * as React from 'react';
import {
  Animated,
  ColorValue,
  FlatListProps,
  GestureResponderEvent,
  ListRenderItemInfo,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';

import { useScrollToTop } from '@react-navigation/native';
import { IPropsSwipeListView, IPropsSwipeRow, RowMap, SwipeListView, SwipeRow } from 'react-native-swipe-list-view';

import theme from '~/app/theme';

import { UI_SIZES, UI_STYLES } from './constants';
import { Svg, SvgIconName } from './picture';
import { SmallText } from './text';

export interface ISwipeAction<ItemT extends { key: string }> {
  action: (row: RowMap<ItemT>, e: GestureResponderEvent) => void;
  actionIcon?: SvgIconName;
  actionIconSize?: number;
  actionColor?: ColorValue;
  actionText?: string;
  backgroundColor?: ColorValue;
  isFirstAction?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface ISwipeActionProps<ItemT extends { key: string }> {
  left?: ISwipeAction<ItemT>[];
  right?: ISwipeAction<ItemT>[];
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
  },
  hiddenRow: {
    overflow: 'hidden',
  },
  swipeAction: {
    alignItems: 'center',
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  swipeActionWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'center',
  },
  swipeActionWrapperOverlap: {
    bottom: 0,
    position: 'absolute',
    top: 0,
  },
});

const defaultSwipeActionWidth = 100;

let isScrollingWhileTouchSwipeAction = false;

const SwipeAction = <ItemT extends { key: string }>(
  props: ISwipeAction<ItemT> & {
    direction: 'left' | 'right';
    rowMap: RowMap<ItemT>;
    swipeActionWidth: number;
  },
) => {
  const wrapperStyle = [styles.swipeActionWrapper];
  const widthStyle = React.useMemo(() => ({ width: props.swipeActionWidth }), [props.swipeActionWidth]);
  const overlapWidth = React.useMemo(() => Math.max(UI_SIZES.screen.width - props.swipeActionWidth, 0), [props.swipeActionWidth]);
  const overlapPositionStyle = React.useMemo(
    () => (props.direction === 'left' ? { left: -overlapWidth } : { right: -overlapWidth }),
    [props.direction, overlapWidth],
  );
  const overlapColorStyle = React.useMemo(() => ({ backgroundColor: props.backgroundColor }), [props.backgroundColor]);
  const overlapWidthStyle = React.useMemo(() => ({ width: overlapWidth }), [overlapWidth]);
  const overlapElement = React.useMemo(
    () =>
      props.backgroundColor && props.isFirstAction ? (
        <View style={[styles.swipeActionWrapperOverlap, overlapColorStyle, overlapWidthStyle, overlapPositionStyle]} />
      ) : null,
    [overlapColorStyle, overlapPositionStyle, overlapWidthStyle, props.backgroundColor, props.isFirstAction],
  );
  return (
    <View style={wrapperStyle}>
      <TouchableOpacity
        onPressIn={() => {
          isScrollingWhileTouchSwipeAction = false;
        }}
        onPressOut={e => {
          setTimeout(() => {
            if (!isScrollingWhileTouchSwipeAction) {
              return props.action(props.rowMap, e);
            }
          }, 25); // 🍔 ! We want to ensure onScrollBeginDrag event will be fired before this !!
        }}>
        <View
          style={[
            styles.swipeAction,
            props.style,
            widthStyle,
            React.useMemo(
              () => (props.backgroundColor ? { backgroundColor: props.backgroundColor, height: '100%' } : {}),
              [props.backgroundColor],
            ),
          ]}>
          {overlapElement}
          {props.actionIcon ? (
            <Svg
              width={props.actionIconSize ?? 16}
              height={props.actionIconSize ?? 16}
              fill={props.actionColor || (props.backgroundColor ? theme.ui.text.inverse : theme.palette.primary.regular)}
              name={props.actionIcon}
            />
          ) : // <SmallText>{props.actionIcon}</SmallText>
          null}
          {props.actionText ? (
            <SmallText
              style={{
                color: props.actionColor || (props.backgroundColor ? theme.ui.text.inverse : theme.palette.primary.regular),
                lineHeight: undefined,
                marginLeft: UI_SIZES.spacing.small,
              }}>
              {props.actionText}
            </SmallText>
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export interface SwipeableListProps<ItemT extends { key: string }> extends Partial<
  Omit<IPropsSwipeListView<ItemT>, 'renderHiddenItem'>
> {
  bottomInset?: boolean;
  hiddenRowStyle?: ViewStyle;
  hiddenItemStyle?: ViewStyle;
  swipeActionWidth?: number;
  itemSwipeActionProps?: (info: ListRenderItemInfo<ItemT>) => ISwipeActionProps<ItemT> | null;
  onOpenRowsChange?: (hasOpenRows: boolean) => void;
}

export const ScrollToTopHandler = ({ listRef }: { listRef: React.RefObject<SwipeListView<unknown>> }) => {
  useScrollToTop(
    React.useRef({
      scrollToTop: () => {
        listRef?.current?.scrollToTop();
      },
    }),
  );
  return null;
};

type SwipeableListType = <ItemT extends { key: string }>(
  props: SwipeableListProps<ItemT> & FlatListProps<ItemT> & { ref?: React.Ref<SwipeListView<ItemT> | null> },
) => React.ReactElement | null;

type SwipeRowWithChildrenProps<ItemT extends { key: string }> = Partial<IPropsSwipeRow<ItemT>> & {
  children?: React.ReactNode;
};

const SwipeableList = React.forwardRef(
  <ItemT extends { key: string }>( // need to write "extends" because we're in a tsx file
    props: SwipeableListProps<ItemT> & FlatListProps<ItemT>,
    ref: React.Ref<SwipeListView<ItemT> | null>,
  ) => {
    const {
      bottomInset,
      data,
      hiddenItemStyle,
      hiddenRowStyle,
      itemSwipeActionProps,
      ListFooterComponent,
      onOpenRowsChange,
      onScrollBeginDrag,
      renderItem,
      scrollIndicatorInsets,
      swipeActionWidth,
      ...otherListProps
    } = props;
    const animatedRefs = React.useRef<{ [key: string]: Animated.Value }>({});
    const preventTouchRefs = React.useRef<{ [key: string]: boolean }>({});
    const openRowKey = React.useRef<string | null>(null);
    const rowMapRef = React.useRef<RowMap<ItemT> | undefined>(undefined);
    const rowTouchableViewRefs = React.useRef<{ [key: string]: View | null }>({});
    const innerSwipeListRef = React.useRef<SwipeListView<ItemT> | null>(null);
    const previousItemSwipeActionProps = React.useRef(itemSwipeActionProps);

    const setInnerSwipeListRef = React.useCallback(
      (node: SwipeListView<ItemT> | null) => {
        innerSwipeListRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref && typeof ref !== 'function') {
          (ref as React.RefObject<SwipeListView<ItemT> | null>).current = node;
        }
      },
      [ref],
    );

    const closeAllOpenRows = React.useCallback(() => {
      if (innerSwipeListRef.current?.closeAllOpenRows) {
        innerSwipeListRef.current.closeAllOpenRows();
      } else if (openRowKey.current) {
        rowMapRef.current?.[openRowKey.current]?.closeRow();
      }

      openRowKey.current = null;
      onOpenRowsChange?.(false);
    }, [onOpenRowsChange]);

    React.useEffect(() => {
      if (previousItemSwipeActionProps.current !== itemSwipeActionProps && itemSwipeActionProps === undefined) {
        if (openRowKey.current !== null) {
          closeAllOpenRows();
        }
      }
      previousItemSwipeActionProps.current = itemSwipeActionProps;
    }, [itemSwipeActionProps, closeAllOpenRows]);

    const realListFooterComponent = React.useMemo(() => {
      const footer = ListFooterComponent;

      const getFooter = () => {
        if (!footer) return null;
        if (React.isValidElement(footer)) return footer;
        return React.createElement(footer);
      };

      const renderedFooter = getFooter();

      if (!bottomInset) return renderedFooter;
      return <View style={styles.footer}>{renderedFooter}</View>;
    }, [bottomInset, ListFooterComponent]);

    const renderHiddenItem = React.useCallback(
      (info: ListRenderItemInfo<ItemT>, rowmap: RowMap<ItemT>, actions: ISwipeActionProps<ItemT> | null | undefined) => {
        if (!actions || (!actions.left && !actions.right)) return null;
        return (
          <View style={[UI_STYLES.rowStretch, hiddenRowStyle]}>
            {actions?.left?.map((p, index) => (
              <SwipeAction
                {...p}
                key={index}
                style={[hiddenItemStyle, p.style] as StyleProp<ViewStyle>}
                rowMap={rowmap}
                swipeActionWidth={swipeActionWidth ?? defaultSwipeActionWidth}
                direction="left"
                isFirstAction={index === 0}
              />
            ))}
            <View style={UI_STYLES.flex1} />
            {actions?.right?.map((p, index) => (
              <SwipeAction
                {...p}
                key={index}
                style={[hiddenItemStyle, p.style] as StyleProp<ViewStyle>}
                rowMap={rowmap}
                swipeActionWidth={swipeActionWidth ?? defaultSwipeActionWidth}
                direction="right"
                isFirstAction={index === (actions.right?.length ?? 0) - 1}
              />
            ))}
          </View>
        );
      },
      [hiddenItemStyle, hiddenRowStyle, swipeActionWidth],
    );

    const getTouchPreventerStyle = (active: boolean) =>
      ({
        height: '100%',
        left: 0,
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: active ? 1 : -1,
      }) as ViewStyle;

    const onRowOpen = (rowKey: string, rowMap: RowMap<ItemT>) => {
      if (!itemSwipeActionProps) {
        rowMap[rowKey]?.closeRow();
        onOpenRowsChange?.(false);
        return;
      }

      // Keep only one opened row at a time to avoid stacked visible actions.
      if (openRowKey.current && openRowKey.current !== rowKey) {
        rowMap[openRowKey.current]?.closeRow();
      }

      if (preventTouchRefs.current) {
        preventTouchRefs.current[rowKey] = true;
        rowTouchableViewRefs.current[rowKey]?.setNativeProps({ style: getTouchPreventerStyle(true) });
      }
      rowMapRef.current = rowMap;
      openRowKey.current = rowKey;
      onOpenRowsChange?.(true);
    };
    const onRowClose = (rowKey: string, _rowMap: RowMap<ItemT>) => {
      if (preventTouchRefs.current) {
        preventTouchRefs.current[rowKey] = false;
        rowTouchableViewRefs.current[rowKey]?.setNativeProps({ style: getTouchPreventerStyle(false) });
      }
      if (openRowKey.current === rowKey) {
        openRowKey.current = null;
      }
      onOpenRowsChange?.(openRowKey.current !== null);
    };

    const closeCurrentRow = (rowKey: string) => {
      rowMapRef.current?.[rowKey]?.closeRow();
    };

    const setIsScrollingWhileTouchSwipeAction = React.useCallback(
      event => {
        isScrollingWhileTouchSwipeAction = true;
        onScrollBeginDrag?.(event);
      },
      [onScrollBeginDrag],
    );
    const realRenderItem = React.useCallback(
      (info: ListRenderItemInfo<ItemT>, rowMap: RowMap<ItemT>) => {
        if (!renderItem) {
          console.error('[swipeableList] renderItem not provided.');
          return null;
        }
        const actions = itemSwipeActionProps?.(info);
        const actionWidth = swipeActionWidth ?? defaultSwipeActionWidth;
        const leftActionsWidth = (actions?.left?.length ?? 0) * actionWidth;
        const rightActionsWidth = (actions?.right?.length ?? 0) * actionWidth;
        const onSwipeValueChange = (swipeData: { key: string; value: number; direction: 'left' | 'right'; isOpen: boolean }) => {
          animatedRefs.current?.[info.item.key]?.setValue(swipeData.value);
        };

        if (animatedRefs.current?.[info.item.key] === undefined) {
          animatedRefs.current[info.item.key] = new Animated.Value(0);
        }

        const animatedValue = animatedRefs.current[info.item.key];
        const getTranslateX = () => {
          if (leftActionsWidth > 0 && rightActionsWidth > 0) {
            return animatedValue.interpolate({
              extrapolate: 'clamp',
              inputRange: [-rightActionsWidth, 0, leftActionsWidth],
              outputRange: [0, rightActionsWidth, 0],
            });
          }
          if (rightActionsWidth > 0) {
            return Animated.add(animatedValue, rightActionsWidth);
          }
          return 0;
        };

        const translateX = getTranslateX();

        const translateStyle = [animatedValue ? { transform: [{ translateX }] } : {}];
        const setRowViewRef = (rowref: View) => {
          if (rowTouchableViewRefs.current) rowTouchableViewRefs.current[info.item.key] = rowref;
        };
        const SwipeRowComponent = SwipeRow as React.ComponentType<SwipeRowWithChildrenProps<ItemT>>;
        const row = (
          <SwipeRowComponent
            disableRightSwipe={(actions?.left?.length ?? 0) === 0}
            disableLeftSwipe={(actions?.right?.length ?? 0) === 0}
            rightOpenValue={(actions?.right?.length ?? 0) * -actionWidth}
            leftOpenValue={(actions?.left?.length ?? 0) * actionWidth}
            onSwipeValueChange={onSwipeValueChange}>
            <Animated.View style={translateStyle}>{renderHiddenItem(info, rowMap, actions)}</Animated.View>
            <View>
              <TouchableWithoutFeedback
                onPress={() => {
                  closeCurrentRow(info.item.key);
                }}>
                <View ref={setRowViewRef} style={getTouchPreventerStyle(preventTouchRefs.current[info.item.key] === true)} />
              </TouchableWithoutFeedback>
              {renderItem(info, rowMap)}
            </View>
          </SwipeRowComponent>
        );
        return row;
      },
      [itemSwipeActionProps, renderHiddenItem, renderItem, swipeActionWidth],
    );

    if (!renderItem) {
      console.error('[swipeableList] renderItem not provided.');
      return null;
    }

    return (
      <>
        <SwipeListView
          {...otherListProps}
          data={data}
          ref={setInnerSwipeListRef}
          closeOnRowOpen
          closeOnRowBeginSwipe
          closeOnRowPress
          // onSwipeValueChange={onSwipeValueChange}
          renderItem={realRenderItem}
          onRowOpen={onRowOpen}
          onRowClose={onRowClose}
          ListFooterComponent={realListFooterComponent}
          scrollIndicatorInsets={scrollIndicatorInsets ?? { right: 0.001 }} // 🍎 Hack to guarantee the scrollbar sticks to the right edge of the screen.
          onScrollBeginDrag={setIsScrollingWhileTouchSwipeAction}
        />
        <ScrollToTopHandler listRef={innerSwipeListRef as React.RefObject<SwipeListView<unknown>>} />
      </>
    );
  },
) as SwipeableListType;

export default SwipeableList;
