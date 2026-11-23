import * as React from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

import { type StaticScreenProps, usePreventRemove } from '@react-navigation/native';

import { defineModal, type ScreenPromiseParams, useScreenPromise } from '~/app/navigation-new';
import { Svg } from '~/framework/components/picture';
import { CaptionBoldText } from '~/framework/components/text';
import Feedback from '~/framework/util/feedback/feedback';
import type { AudiencePoint, AudienceRect } from '~/modules/audience/model';
import { getReactionAt } from '~/modules/audience/model/business';
import { useReactionPickerGestureStore } from '~/modules/audience/store';
import { getReactionIconName } from '~/modules/audience/util';
import { I18n } from '~/util/i18n';

import styles, { getPickerPosition, getPickerWidth, PICKER_HEIGHT, PICKER_ITEM_WIDTH, REACTION_ICON_SIZE } from './styles';

export type AudienceReactParams = {
  /** Where the react button is, in the coordinates of the page: the picker is shown above it. */
  anchor: AudienceRect;
  /** The reactions of the picker. */
  reactionTypes: string[];
};

type ReactionAnimation = Record<'opacity' | 'rotate' | 'scale' | 'textOpacity' | 'translateY', Animated.Value>;

const STAGGER_DELAY = 50;
const ANIMATION_DURATION = 150;
/** The picker fades out once the reactions have started to leave. */
const PICKER_HIDE_DELAY = 200;

const timing = (value: Animated.Value, toValue: number, duration = ANIMATION_DURATION, delay = 0) =>
  Animated.timing(value, { delay, duration, toValue, useNativeDriver: true });

const createAnimations = (reactionTypes: string[]) =>
  Object.fromEntries(
    reactionTypes.map(reaction => [
      reaction,
      {
        opacity: new Animated.Value(0),
        rotate: new Animated.Value(0),
        scale: new Animated.Value(1),
        textOpacity: new Animated.Value(0),
        translateY: new Animated.Value(-100),
      },
    ]),
  ) as Record<string, ReactionAnimation>;

/**
 * The picker of reactions, above the react button. Gives the reaction chosen to `navigateAsync`, `undefined` if the user leaves.
 * A reaction is chosen by a press, or by the gesture started on the react button (long press, then the finger goes to a reaction and
 * leaves the screen there): the touch stays with the button, which gives its moves through `useReactionPickerGestureStore`.
 */
const AudienceReactModal = ({ route }: StaticScreenProps<ScreenPromiseParams<AudienceReactParams, string | undefined>>) => {
  const { resolve } = useScreenPromise(route);
  const { anchor, reactionTypes } = route.params;

  const rootRef = React.useRef<React.ComponentRef<typeof View>>(null);
  const [modalOrigin, setModalOrigin] = React.useState<AudiencePoint | undefined>(undefined);
  const hoveredRef = React.useRef<string | undefined>(undefined);
  const isClosingRef = React.useRef(false);

  const pickerOpacity = React.useRef(new Animated.Value(0)).current;
  const animations = React.useMemo(() => createAnimations(reactionTypes), [reactionTypes]);
  const pickerWidth = getPickerWidth(reactionTypes.length);
  const pickerRect = React.useMemo(
    () => ({ height: PICKER_HEIGHT, width: pickerWidth, x: anchor.x, y: anchor.y - PICKER_HEIGHT }),
    [anchor.x, anchor.y, pickerWidth],
  );

  // The modal may not start at the top of the page (status bar): the picker is placed from where the modal is.
  const onLayout = React.useCallback(() => {
    rootRef.current?.measure((_x, _y, _width, _height, pageX, pageY) => setModalOrigin({ x: pageX, y: pageY }));
  }, []);

  React.useEffect(() => {
    if (!modalOrigin) return;
    timing(pickerOpacity, 1).start();
    reactionTypes.forEach((reaction, index) => {
      Animated.parallel([
        timing(animations[reaction].translateY, 0, ANIMATION_DURATION, STAGGER_DELAY * index),
        timing(animations[reaction].opacity, 1, ANIMATION_DURATION, STAGGER_DELAY * index),
      ]).start();
    });
  }, [animations, modalOrigin, pickerOpacity, reactionTypes]);

  // The picker leaves by its own animations, to the end, then the screen goes without animation: as the screen leaves the stack,
  // react-native-screens shows a still snapshot of it (the reactions would freeze in the middle of their animation).
  const [isClosing, setIsClosing] = React.useState(false);
  const close = React.useCallback(
    (reaction: string | undefined) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      setIsClosing(true);
      Feedback.actionDone();
      Animated.parallel([
        ...reactionTypes.map((item, index) =>
          Animated.parallel([
            timing(animations[item].translateY, -100, ANIMATION_DURATION, STAGGER_DELAY * index),
            timing(animations[item].opacity, 0, ANIMATION_DURATION, STAGGER_DELAY * index),
          ]),
        ),
        timing(pickerOpacity, 0, ANIMATION_DURATION, PICKER_HIDE_DELAY),
      ]).start(() => resolve(reaction));
    },
    [animations, pickerOpacity, reactionTypes, resolve],
  );

  // Back button (Android): the picker leaves the same way.
  usePreventRemove(!isClosing, () => close(undefined));

  const unzoom = React.useCallback(() => {
    const hovered = hoveredRef.current;
    if (!hovered) return;
    timing(animations[hovered].textOpacity, 0, 120).start();
    timing(animations[hovered].rotate, 0).start();
    reactionTypes.forEach(reaction => timing(animations[reaction].scale, 1, 250).start());
    hoveredRef.current = undefined;
  }, [animations, reactionTypes]);

  const zoomOn = React.useCallback(
    (reaction: string) => {
      if (hoveredRef.current === reaction) return;
      Feedback.actionDone();
      unzoom();
      hoveredRef.current = reaction;
      reactionTypes.forEach(item => {
        if (item !== reaction) {
          timing(animations[item].scale, 0.8, 250).start();
          return;
        }
        timing(animations[reaction].scale, 1.8, 250).start();
        timing(animations[reaction].textOpacity, 1, 120).start();
        Animated.loop(
          Animated.sequence([
            timing(animations[reaction].rotate, 6),
            timing(animations[reaction].rotate, -6, 300),
            timing(animations[reaction].rotate, 0),
          ]),
        ).start();
      });
    },
    [animations, reactionTypes, unzoom],
  );

  // The gesture started on the react button.
  const point = useReactionPickerGestureStore(state => state.point);
  const released = useReactionPickerGestureStore(state => state.released);
  React.useEffect(() => {
    if (!point || !modalOrigin) return;
    const reaction = getReactionAt(point, pickerRect, PICKER_ITEM_WIDTH, reactionTypes);
    if (reaction) zoomOn(reaction);
    else unzoom();
  }, [modalOrigin, pickerRect, point, reactionTypes, unzoom, zoomOn]);
  React.useEffect(() => {
    if (released && hoveredRef.current) close(hoveredRef.current);
  }, [close, released]);

  const onPressBackground = React.useCallback(() => close(undefined), [close]);

  const pickerStyle = React.useMemo(
    () => [styles.picker, { opacity: pickerOpacity }, modalOrigin && getPickerPosition(anchor, modalOrigin)],
    [anchor, modalOrigin, pickerOpacity],
  );

  return (
    <View ref={rootRef} style={styles.container} onLayout={onLayout}>
      <TouchableOpacity style={styles.container} activeOpacity={1} onPress={onPressBackground} testID="cancel-reaction-btn">
        {modalOrigin ? (
          <Animated.View style={pickerStyle}>
            {reactionTypes.map((reaction, index) => {
              const iconName = getReactionIconName(reaction);
              const rotate = animations[reaction].rotate.interpolate({
                inputRange: [-6, 0, 6],
                outputRange: ['-6deg', '0deg', '6deg'],
              });
              return (
                <React.Fragment key={reaction}>
                  <Animated.View
                    style={[
                      styles.pickerLabel,
                      { left: index * (pickerWidth / reactionTypes.length), opacity: animations[reaction].textOpacity },
                    ]}>
                    <CaptionBoldText style={styles.pickerLabelText}>
                      {I18n.get(`audience-${reaction.toLowerCase()}`)}
                    </CaptionBoldText>
                  </Animated.View>
                  <Animated.View
                    style={{
                      opacity: animations[reaction].opacity,
                      transform: [
                        { translateY: animations[reaction].translateY },
                        { scale: animations[reaction].scale },
                        { rotate },
                      ],
                    }}>
                    <TouchableOpacity style={styles.pickerItem} onPress={() => close(reaction)} testID="post-reaction-btn">
                      {iconName ? <Svg name={iconName} width={REACTION_ICON_SIZE} height={REACTION_ICON_SIZE} /> : null}
                    </TouchableOpacity>
                  </Animated.View>
                </React.Fragment>
              );
            })}
          </Animated.View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
};

export default defineModal({
  // No animation of the screen: the picker fades in and out by itself (see `close`).
  options: () => ({ animation: 'none', headerShown: false, presentation: 'transparentModal' }),
  screen: AudienceReactModal,
});
