import * as React from 'react';
import { Animated, Platform, TouchableOpacity } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NativeModal, type NativeModalCloseReason } from '~/app/navigation-new';
import { Svg } from '~/framework/components/picture';
import { CaptionBoldText } from '~/framework/components/text';
import { getReactionIconName } from '~/modules/audience/util';
import { I18n } from '~/util/i18n';

import styles, { getPickerRect, REACTION_ICON_SIZE } from './styles';
import type { ReactionPickerProps } from './types';

type ReactionAnimation = Record<'opacity' | 'rotate' | 'scale' | 'textOpacity' | 'translateY', Animated.Value>;

const STAGGER_DELAY = 50;
const ANIMATION_DURATION = 150;
/** The picker fades out once the reactions have started to leave. */
const PICKER_HIDE_DELAY = 200;
const isAndroid = Platform.OS === 'android';

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
 * The picker of reactions, above the react button, in a `NativeModal` (`Modal` of react-native): not a screen, as it hangs on the
 * button and on its gesture (see `AudienceReactButton`).
 * Only shows: the button decides which reaction is under the finger (`hoveredReaction`) and when the picker leaves (`closing`); the
 * picker tells when it has left (`onHidden`), for the button to hide it.
 */
const ReactionPicker = ({
  anchor,
  closing,
  hoveredReaction,
  onClose,
  onDismiss,
  onHidden,
  onPick,
  reactionTypes,
  visible,
}: Readonly<ReactionPickerProps>) => {
  // The `Modal` starts under the status bar on Android, the window of the app does not.
  const topInset = useSafeAreaInsets().top;
  const pickerOpacity = React.useRef(new Animated.Value(0)).current;
  const animations = React.useMemo(() => createAnimations(reactionTypes), [reactionTypes]);
  const pickerRect = anchor ? getPickerRect(anchor, reactionTypes.length) : undefined;

  // Shows.
  React.useEffect(() => {
    if (!visible) return;
    timing(pickerOpacity, 1).start();
    reactionTypes.forEach((reaction, index) => {
      Animated.parallel([
        timing(animations[reaction].translateY, 0, ANIMATION_DURATION, STAGGER_DELAY * index),
        timing(animations[reaction].opacity, 1, ANIMATION_DURATION, STAGGER_DELAY * index),
      ]).start();
    });
  }, [animations, pickerOpacity, reactionTypes, visible]);

  // Leaves, then tells it (`onHidden`): the `Modal` must stay visible until the end. On Android, it removes its view as soon as it is
  // hidden, and fades out a still copy of it: the reactions would freeze in the middle of their animation.
  const onHiddenRef = React.useRef(onHidden);
  onHiddenRef.current = onHidden;
  React.useEffect(() => {
    if (!closing) return;
    Animated.parallel([
      ...reactionTypes.map((reaction, index) =>
        Animated.parallel([
          timing(animations[reaction].translateY, -100, ANIMATION_DURATION, STAGGER_DELAY * index),
          timing(animations[reaction].opacity, 0, ANIMATION_DURATION, STAGGER_DELAY * index),
        ]),
      ),
      timing(pickerOpacity, 0, ANIMATION_DURATION, PICKER_HIDE_DELAY),
    ]).start(() => onHiddenRef.current());
  }, [animations, closing, pickerOpacity, reactionTypes]);

  // Zooms on the reaction under the finger.
  React.useEffect(() => {
    if (!hoveredReaction || !animations[hoveredReaction]) return;
    reactionTypes.forEach(reaction => {
      if (reaction !== hoveredReaction) {
        timing(animations[reaction].scale, 0.8, 250).start();
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
    return () => {
      timing(animations[hoveredReaction].textOpacity, 0, 120).start();
      timing(animations[hoveredReaction].rotate, 0).start();
      reactionTypes.forEach(reaction => timing(animations[reaction].scale, 1, 250).start());
    };
  }, [animations, hoveredReaction, reactionTypes]);

  // Back button: closes with the animations. Screen left: the `Modal` is already hiding.
  const onNativeClose = React.useCallback(
    (reason: NativeModalCloseReason) => (reason === 'back' ? onClose() : onDismiss()),
    [onClose, onDismiss],
  );

  const pickerStyle = React.useMemo(
    () => [
      styles.picker,
      { opacity: pickerOpacity },
      pickerRect && { left: pickerRect.x, top: pickerRect.y - (isAndroid ? topInset : 0) },
    ],
    [pickerOpacity, pickerRect, topInset],
  );

  return (
    <NativeModal transparent animationType="fade" visible={visible} onClose={onNativeClose}>
      <TouchableOpacity style={styles.background} activeOpacity={1} onPress={onClose} testID="cancel-reaction-btn">
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
                    {
                      left: index * ((pickerRect?.width ?? 0) / reactionTypes.length),
                      opacity: animations[reaction].textOpacity,
                    },
                  ]}>
                  <CaptionBoldText style={styles.pickerLabelText}>{I18n.get(`audience-${reaction.toLowerCase()}`)}</CaptionBoldText>
                </Animated.View>
                <Animated.View
                  style={{
                    opacity: animations[reaction].opacity,
                    transform: [{ translateY: animations[reaction].translateY }, { scale: animations[reaction].scale }, { rotate }],
                  }}>
                  <TouchableOpacity style={styles.pickerItem} onPress={() => onPick(reaction)} testID="post-reaction-btn">
                    {iconName ? <Svg name={iconName} width={REACTION_ICON_SIZE} height={REACTION_ICON_SIZE} /> : null}
                  </TouchableOpacity>
                </Animated.View>
              </React.Fragment>
            );
          })}
        </Animated.View>
      </TouchableOpacity>
    </NativeModal>
  );
};

export default ReactionPicker;
