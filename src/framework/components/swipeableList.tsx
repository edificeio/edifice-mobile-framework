/**
 * Renders a FlatList with swipeable elements.
 * Gestures are recognized to automatically unswipe the selected elements whe other touches are involved.
 * Based on npm mobile `react-native-swipeable`
 *
 * Usage :
 * - Same props as FlatList
 * - Same props as Swipeable (common Swipeable props for all list items)
 * - additional `itemSwipeableProps`, works like `renderItem` prop and returns specific Swipeable props for of each list item.
 *
 * Don't forget to store the Ref of the list. Call `listRef.recenter()` to recenter any swiped element.
 *
 * Example :
 * const listRef = React.createRef<SwipeableListHandle<IItemType>>();
 * <SwipeableList
 *     ref={listRef}
 *     data={data}
 *     rightButtonWidth={140} // Common prop applied to each swipeable list item
 *     itemSwipeableProps={({ item, index, separators }) => ({
 *         rightButtons: [
 *             <Pressable
 *                 onPress={() => {
 *                     doSomething(item);
 *                     listRef.current?.recenter(); // Call this to recenter item after activate swipe button
 *                 }}
 *             >{item.text}</Pressable>, ...
 *         ]
 *     })}
 * />
 */

import * as React from 'react';
import { FlatList, FlatListProps, ListRenderItemInfo, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import Swipeable from 'react-native-swipeable';

// Redecalare forwardRef @see https://fettblog.eu/typescript-react-generic-forward-refs/#option-3%3A-augment-forwardref
declare module 'react' {
  function forwardRef<T, P = object>(
    render: (props: P, ref: React.Ref<T>) => React.ReactElement | null,
  ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}

type SwipeableProps = { [prop in Swipeable.propTypes]: any };

export interface SwipeableListProps<ItemT> extends FlatListProps<ItemT>, SwipeableProps {
  itemSwipeableProps?: (info: ListRenderItemInfo<ItemT>) => SwipeableProps | null;
}

export interface SwipeableList<ItemT> extends FlatList<ItemT> {
  recenter: (filter?: (index: string, ref: React.Ref<Swipeable>) => boolean) => void;
}

const getTouchableViewStyle = (active: boolean) =>
  ({
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: active ? -1 : 1,
    width: '100%',
    height: '100%',
  } as ViewStyle);

const SwipeableItem = <ItemT extends any>({
  info,
  refControl,
  renderItem,
  swipeableProps,
}: {
  // need to write "extends" because we're in a tsx file
  info: ListRenderItemInfo<ItemT>;
  refControl: {
    init: (key: string, ref: React.Ref<Swipeable>, view: React.Ref<View>) => void;
    on: (key: string, ref: React.Ref<Swipeable>) => void;
    off: (key: string, ref?: React.Ref<Swipeable>) => void;
  };
  renderItem: SwipeableListProps<ItemT>['renderItem'];
  swipeableProps?: SwipeableProps;
}) => {
  if (!renderItem) return null;
  const swipeableRef = React.useRef<Swipeable>(null);
  const touchableViewRef = React.useRef<View>(null);
  React.useEffect(() => {
    refControl.init(info.index.toString(), swipeableRef, touchableViewRef);
  });
  return (
    <Swipeable
      ref={swipeableRef}
      {...swipeableProps}
      onLeftButtonsActivate={() => {
        refControl.on(info.index.toString(), swipeableRef);
        swipeableProps?.['onLeftButtonsActivate']?.();
      }}
      onRightButtonsActivate={() => {
        refControl.on(info.index.toString(), swipeableRef);
        swipeableProps?.['onLeftButtonsActivate']?.();
      }}
      onLeftButtonsDeactivate={() => {
        refControl.off(info.index.toString(), swipeableRef);
        swipeableProps?.['onLeftButtonsDeactivate']?.();
      }}
      onRightButtonsDeactivate={() => {
        refControl.off(info.index.toString(), swipeableRef);
        swipeableProps?.['onLeftButtonsDeactivate']?.();
      }}>
      <TouchableWithoutFeedback
        onPress={() => {
          refControl.off(info.index.toString(), undefined);
        }}>
        <View ref={touchableViewRef} style={getTouchableViewStyle(true)} />
      </TouchableWithoutFeedback>
      {renderItem?.(info)}
    </Swipeable>
  );
};

export default React.forwardRef(
  <ItemT extends any>( // need to write "extends" because we're in a tsx file
    props: SwipeableListProps<ItemT>,
    ref: React.Ref<SwipeableList<ItemT>>,
  ) => {
    const { renderItem, itemSwipeableProps, ...propsToPass } = props;
    const flatListRef = React.useRef<FlatList<ItemT>>(null);
    const activeSwipablesRefs: { [index: string]: React.Ref<Swipeable> } = {};
    const allSwipeablesRefs: { [index: string]: { swip: React.Ref<Swipeable>; view: React.Ref<View> } } = {};

    // Props to pass

    const listSwipeableProps = Object.fromEntries(
      Object.entries(propsToPass).filter(([propname, propvalue]) => Swipeable.propTypes[propname]),
    ) as SwipeableProps;
    const restProps = Object.fromEntries(
      Object.entries(propsToPass).filter(([propname, propvalue]) => !Swipeable.propTypes[propname]),
    ) as FlatListProps<ItemT>;

    // List control

    const commonSwipeableProps = {
      onSwipeStart: () => {
        flatListRef?.current?.setNativeProps({
          scrollEnabled: false,
        });
      },
      onSwipeRelease: () => {
        flatListRef?.current?.setNativeProps({
          scrollEnabled: true,
        });
      },
    };

    const recenter = (filter?: (index: string, ref: React.Ref<Swipeable>) => boolean) => {
      Object.entries(activeSwipablesRefs).forEach(([index, ref]) => {
        if ((filter ?? (() => true))(index, ref)) {
          (ref as null | React.MutableRefObject<Swipeable>)?.current?.recenter();
          delete activeSwipablesRefs[index];
        }
      });
      Object.values(allSwipeablesRefs).forEach(({ swip, view }) => {
        (view as null | React.MutableRefObject<View>)?.current?.setNativeProps({ style: getTouchableViewStyle(true) });
      });
    };

    React.useImperativeHandle(
      ref,
      () =>
        ({
          recenter,
        } as SwipeableList<ItemT>),
    );

    return (
      <FlatList
        {...restProps}
        ref={flatListRef}
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={info => {
          const computedItemSwipeableProps = { ...listSwipeableProps, ...(itemSwipeableProps?.(info) ?? {}) };
          const finalItemSwipeableProps = {
            ...computedItemSwipeableProps,
            ...Object.fromEntries(
              Object.entries(commonSwipeableProps).map(([name, fct]) => [
                name,
                () => {
                  fct();
                  computedItemSwipeableProps[name]?.();
                },
              ]),
            ),
          };
          return (
            <SwipeableItem
              info={info}
              refControl={{
                init: (index, ref, view) => {
                  allSwipeablesRefs[index] = {
                    swip: ref,
                    view,
                  };
                  // console.log("init", index, ref);
                },
                on: (index, ref) => {
                  recenter((index2, ref2) => index !== index2);
                  activeSwipablesRefs[index] = ref;
                  Object.values(allSwipeablesRefs).forEach(({ swip, view }) => {
                    (view as null | React.MutableRefObject<View>)?.current?.setNativeProps({ style: getTouchableViewStyle(false) });
                  });
                  // console.log("on", index, ref);
                },
                off: (index, ref) => {
                  if (!ref) {
                    recenter();
                  } else {
                    delete activeSwipablesRefs[index];
                    // console.log("off", index, ref);
                    Object.values(allSwipeablesRefs).forEach(({ swip, view }) => {
                      (view as null | React.MutableRefObject<View>)?.current?.setNativeProps({
                        style: getTouchableViewStyle(true),
                      });
                    });
                  }
                },
              }}
              renderItem={renderItem}
              swipeableProps={finalItemSwipeableProps}
            />
          );
        }}
        onScrollBeginDrag={e => {
          recenter();
          Object.values(allSwipeablesRefs).forEach(({ swip, view }) => {
            (view as null | React.MutableRefObject<View>)?.current?.setNativeProps({ style: getTouchableViewStyle(true) });
          });
          restProps.onScrollBeginDrag?.(e);
        }}
      />
    );
  },
);
