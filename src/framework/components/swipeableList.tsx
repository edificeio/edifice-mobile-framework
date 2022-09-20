/**
 * Renders a FlatList with swipeable elements.
 * Gestures are recognized to automatically unswipe the selected elements whe other touches are involved.
 * Based on npm mobile `react-native-swipe-list-view`
 *
 * Usage :
 * - Same props as FlatList
 * - Same props as SwipeListView
 * - additional `itemSwipeActionProps`, works like `renderItem` prop and returns specific Swipeable props for of each list item.
 *
 * Don't forget to store the Ref of the list. Call `listRef.recenter()` to recenter any swiped element.
 *
 * Example :
 * const listRef = React.createRef<SwipeableListHandle<IItemType>>();
 * <SwipeableList
 *     data={data}
 *     swipeActionWidth={140} // Width of one action button in px
 *     rightOpenValue={-140} // Need to set this manually
 *     // every props exposed from react-native-swipe-list-view
 *     itemSwipeActionProps={({ item }) => ({
 *       right : {
 *         action: async row => {
 *           Alert.alert(item.text);
 *           row[item.id]?.closeRow();
 *         },
 *         actionColor: theme.palette.status.warning,
 *         actionText: I18n.t('timeline.reportAction.button'),
 *         actionIcon: 'ui-answer',
 *       }
 *     })}
 *     hiddenRowStyle={{margin: 10}} // styles for the row wrapper
 *     hiddenItemStyle={UI_STYLES.justifyEnd} // style for every action
 * />
 */
import * as React from 'react';
import {
  Animated,
  ColorValue,
  FlatListProps,
  GestureResponderEvent,
  ListRenderItemInfo,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { IPropsSwipeListView, RowMap, SwipeListView } from 'react-native-swipe-list-view';

import theme from '~/app/theme';

import { UI_SIZES, UI_STYLES } from './constants';
import { NamedSVG } from './picture';
import { SmallText } from './text';

// Redecalare forwardRef @see https://fettblog.eu/typescript-react-generic-forward-refs/#option-3%3A-augment-forwardref
declare module 'react' {
  function forwardRef<T, P = object>(
    render: (props: P, ref: React.Ref<T>) => React.ReactElement | null,
  ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}

export interface ISwipeAction<ItemT extends { key: string }> {
  action: (row: RowMap<ItemT>, e: GestureResponderEvent) => void;
  actionIcon?: string;
  actionColor?: ColorValue;
  actionText?: string;
  backgroundColor?: ColorValue;
  style?: ViewStyle;
}

export interface ISwipeActionProps<ItemT extends { key: string }> {
  left?: ISwipeAction<ItemT>[];
  right?: ISwipeAction<ItemT>[];
}

const styles = StyleSheet.create({
  swipeActionWrapper: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: UI_SIZES.spacing.small,
    flex: 0,
  },
});

const defaultSwipeActionWidth = 100;

const SwipeAction = <ItemT extends { key: string }>(
  props: ISwipeAction<ItemT> & {
    ikey: string;
    rowMap: RowMap<ItemT>;
    animatedRefs?: { [key: string]: Animated.Value };
    swipeActionWidth: number;
  },
) => {
  if (props.animatedRefs && props.animatedRefs?.[props.ikey] === undefined) {
    props.animatedRefs[props.ikey] = new Animated.Value(0);
    props.animatedRefs[props.ikey].setOffset(props.swipeActionWidth);
  }
  const wrapperStyle = [
    styles.swipeActionWrapper,
    props.animatedRefs?.[props.ikey] ? { transform: [{ translateX: props.animatedRefs?.[props.ikey] }] } : {},
  ];
  const widthStyle = React.useMemo(() => ({ width: props.swipeActionWidth }), [props.swipeActionWidth]);
  return (
    <Animated.View style={wrapperStyle}>
      <TouchableOpacity
        onPress={async e => {
          return props.action(props.rowMap, e);
        }}>
        <View style={[styles.swipeAction, props.style, widthStyle]}>
          {props.actionIcon ? (
            <NamedSVG
              width={16}
              height={16}
              fill={props.actionColor || (props.backgroundColor ? theme.ui.text.inverse : theme.palette.primary.regular)}
              name={props.actionIcon}
            />
          ) : // <SmallText>{props.actionIcon}</SmallText>
          null}
          {props.actionText ? (
            <SmallText
              style={{
                color: props.actionColor || (props.backgroundColor ? theme.ui.text.inverse : theme.palette.primary.regular),
                marginLeft: UI_SIZES.spacing.small,
              }}>
              {props.actionText}
            </SmallText>
          ) : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export interface SwipeableListProps<ItemT extends { key: string }>
  extends Partial<Omit<IPropsSwipeListView<ItemT>, 'renderHiddenItem'>> {
  hiddenRowStyle?: ViewStyle;
  hiddenItemStyle?: ViewStyle;
  swipeActionWidth?: number;
  itemSwipeActionProps?: (info: ListRenderItemInfo<ItemT>) => ISwipeActionProps<ItemT> | null;
}

export default React.forwardRef(
  <ItemT extends { key: string }>( // need to write "extends" because we're in a tsx file
    props: SwipeableListProps<ItemT> & FlatListProps<ItemT>,
    ref: React.Ref<SwipeListView<ItemT>>,
  ) => {
    const { itemSwipeActionProps, hiddenRowStyle, hiddenItemStyle, swipeActionWidth, data, ...otherListProps } = props;
    const animatedRefs = React.useRef<{ [key: string]: Animated.Value }>();

    const renderHiddenItem = React.useCallback(
      (info: ListRenderItemInfo<ItemT>, rowmap: RowMap<ItemT>) => {
        const actions = itemSwipeActionProps?.(info);
        if (!actions || (!actions.left && !actions.right)) return null;
        if (animatedRefs.current === undefined) animatedRefs.current = {};
        return (
          <View style={[UI_STYLES.rowStretch, hiddenRowStyle]}>
            {actions?.left?.map(p => (
              <SwipeAction
                {...p}
                style={[hiddenItemStyle, p.style] as ViewStyle}
                rowMap={rowmap}
                ikey={info.item.key}
                animatedRefs={animatedRefs.current}
                swipeActionWidth={(swipeActionWidth ?? defaultSwipeActionWidth) * actions.left!.length}
              />
            ))}
            <View style={UI_STYLES.flex1} />
            {actions?.right?.map(p => (
              <SwipeAction
                {...p}
                style={[hiddenItemStyle, p.style] as ViewStyle}
                rowMap={rowmap}
                ikey={info.item.key}
                animatedRefs={animatedRefs.current}
                swipeActionWidth={(swipeActionWidth ?? defaultSwipeActionWidth) * actions.right!.length}
              />
            ))}
          </View>
        );
      },
      [hiddenItemStyle, hiddenRowStyle, itemSwipeActionProps, swipeActionWidth],
    );

    const onSwipeValueChange = React.useCallback(
      (swipeData: { key: string; value: number; direction: 'left' | 'right'; isOpen: boolean }) => {
        animatedRefs.current?.[swipeData.key]?.setValue(swipeData.value);
      },
      [],
    );

    return (
      <SwipeListView
        {...otherListProps}
        data={data}
        ref={ref}
        renderHiddenItem={renderHiddenItem}
        onSwipeValueChange={onSwipeValueChange}
      />
    );
  },
);
