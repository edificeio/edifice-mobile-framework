import * as React from 'react';
import { Animated, type LayoutChangeEvent, View } from 'react-native';

import { GestureDetector, useExclusiveGestures, usePanGesture, useTapGesture } from 'react-native-gesture-handler';

import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import Feedback from '~/framework/util/feedback/feedback';
import type { AudienceRect } from '~/modules/audience/model';
import { getReactionAt } from '~/modules/audience/model/business';
import { I18n } from '~/util/i18n';

import { getPickerRect, PICKER_ITEM_WIDTH, ReactionPicker } from './reaction-picker';
import styles from './styles';
import type { AudienceReactButtonProps } from './types';

/** Where the finger is: in the window (`absolute…`) and in the button. */
type GesturePosition = { absoluteX: number; absoluteY: number; x: number; y: number };

const LONG_PRESS_DELAY = 300;
/** Beyond, the touch is a scroll, not a press (the pan of the long press fails at the same distance). */
const TAP_MAX_DISTANCE = 10;
const BUTTON_ANIMATION_DELAY = 200;

/**
 * The button to react to a resource, with its picker of reactions (`ReactionPicker`).
 * - A long press opens the picker above the button; the finger can go on to a reaction and leave the screen there to choose it. The
 *   page does not scroll meanwhile.
 * - A press removes the reaction of the user, or opens the picker if there is none.
 * The picker is a `NativeModal`: it closes when the button is unmounted (screen removed), and when the screen is left mounted under
 * another one.
 */
const AudienceReactButton = ({
  onDeleteReaction,
  onPostReaction,
  onUpdateReaction,
  reactionTypes,
  userReaction,
}: Readonly<AudienceReactButtonProps>) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const [anchor, setAnchor] = React.useState<AudienceRect | undefined>(undefined);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [hoveredReaction, setHoveredReaction] = React.useState<string | undefined>(undefined);

  // The gestures call these functions from native callbacks: the refs give them the current values.
  const anchorRef = React.useRef<AudienceRect | undefined>(undefined);
  const isOpenRef = React.useRef(false);
  const isClosingRef = React.useRef(false);
  const hoveredReactionRef = React.useRef<string | undefined>(undefined);

  // Delayed steps (button animation): cancelled if the button is unmounted meanwhile.
  const timeoutsRef = React.useRef(new Set<ReturnType<typeof setTimeout>>());
  const later = React.useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      timeoutsRef.current.delete(timeout);
      callback();
    }, delay);
    timeoutsRef.current.add(timeout);
  }, []);
  React.useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(clearTimeout);
      timeouts.clear();
    };
  }, []);

  const animateButton = React.useCallback(() => {
    Animated.sequence([
      Animated.timing(scale, { duration: 150, toValue: 1.5, useNativeDriver: true }),
      Animated.timing(scale, { duration: 150, toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [scale]);

  const setHovered = React.useCallback((reaction: string | undefined) => {
    hoveredReactionRef.current = reaction;
    setHoveredReaction(reaction);
  }, []);

  const sizeRef = React.useRef({ height: 0, width: 0 });
  const onLayout = React.useCallback((event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    sizeRef.current = { height, width };
  }, []);

  // Where the button is in the window, where the `Modal` of the picker draws. From the touch, not from `measure` (or
  // `measureInWindow`): they come from the React tree, which does not know where a sheet (modal of the navigation) is on the screen.
  // The gesture gives the position of the finger natively, in the window (`absoluteX`) and in the button (`x`).
  const measureAnchor = React.useCallback((touch: GesturePosition) => {
    anchorRef.current = { ...sizeRef.current, x: touch.absoluteX - touch.x, y: touch.absoluteY - touch.y };
  }, []);

  const openPicker = React.useCallback(() => {
    if (isOpenRef.current || !anchorRef.current) return;
    isOpenRef.current = true;
    Feedback.actionDone();
    setAnchor(anchorRef.current);
    setIsOpen(true);
  }, []);

  const closePicker = React.useCallback(() => {
    if (!isOpenRef.current || isClosingRef.current) return;
    isClosingRef.current = true;
    Feedback.actionDone();
    setIsClosing(true);
  }, []);

  // The reactions have left: the `Modal` is hidden (see `ReactionPicker`).
  const onPickerHidden = React.useCallback(() => {
    if (!isClosingRef.current) return;
    isOpenRef.current = false;
    isClosingRef.current = false;
    setIsOpen(false);
    setIsClosing(false);
    setHovered(undefined);
  }, [setHovered]);

  // The screen of the button was left, mounted under another one (see `NativeModal`): the `Modal` is already hiding, the picker closes at once.
  const dismissPicker = React.useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current.clear();
    isOpenRef.current = false;
    isClosingRef.current = false;
    setIsOpen(false);
    setIsClosing(false);
    setHovered(undefined);
  }, [setHovered]);

  const pickReaction = React.useCallback(
    (reaction: string) => {
      if (isClosingRef.current) return;
      Feedback.actionDone();
      // ToDo(audience-migration): `POST` when the user already reacted, `PUT` otherwise: looks inverted, kept as is (fiche §6, 8).
      if (userReaction) onPostReaction(reaction);
      else onUpdateReaction(reaction);
      closePicker();
      later(animateButton, BUTTON_ANIMATION_DELAY);
    },
    [animateButton, closePicker, later, onPostReaction, onUpdateReaction, userReaction],
  );

  const deleteReaction = React.useCallback(() => {
    Feedback.actionDone();
    onDeleteReaction();
    closePicker();
    animateButton();
  }, [animateButton, closePicker, onDeleteReaction]);

  // The finger moves over the open picker: the reaction under it is zoomed.
  const hover = React.useCallback(
    (touch: GesturePosition) => {
      if (!isOpenRef.current || isClosingRef.current || !anchorRef.current) return;
      const point = { x: touch.absoluteX, y: touch.absoluteY };
      const reaction = getReactionAt(
        point,
        getPickerRect(anchorRef.current, reactionTypes.length),
        PICKER_ITEM_WIDTH,
        reactionTypes,
      );
      if (reaction === hoveredReactionRef.current) return;
      if (reaction) Feedback.actionDone();
      setHovered(reaction);
    },
    [reactionTypes, setHovered],
  );

  // The finger leaves the screen: the reaction under it is chosen. Elsewhere, the picker stays open.
  const release = React.useCallback(() => {
    if (isOpenRef.current && hoveredReactionRef.current) pickReaction(hoveredReactionRef.current);
  }, [pickReaction]);

  // Native gestures, not the JS responder (`PanResponder`): a JS responder does not stop the scroll view that contains it, an active
  // native gesture does. A pan that activates after a long press, not a long press: a long press is cancelled as soon as the finger
  // goes further than a few points. If the finger moves before the delay, the pan fails and the page scrolls as usual.
  const holdAndDrag = usePanGesture({
    activateAfterLongPress: LONG_PRESS_DELAY,
    onActivate: openPicker,
    onBegin: measureAnchor,
    onFinalize: release,
    onUpdate: hover,
    runOnJS: true,
  });
  const tap = useTapGesture({
    maxDistance: TAP_MAX_DISTANCE,
    onActivate: () => {
      if (userReaction) deleteReaction();
      else openPicker();
    },
    runOnJS: true,
  });
  const gesture = useExclusiveGestures(holdAndDrag, tap);

  const animatedStyle = React.useMemo(() => [styles.buttonView, { transform: [{ scale }] }], [scale]);

  return (
    <View>
      {/* Mounted only while open, until the end of its closing: the button shows in lists, once per resource. */}
      {isOpen ? (
        <ReactionPicker
          anchor={anchor}
          closing={isClosing}
          hoveredReaction={hoveredReaction}
          onClose={closePicker}
          onDismiss={dismissPicker}
          onHidden={onPickerHidden}
          onPick={pickReaction}
          reactionTypes={reactionTypes}
          visible
        />
      ) : null}
      <GestureDetector gesture={gesture}>
        <Animated.View style={animatedStyle} onLayout={onLayout}>
          <DefaultButton
            text={I18n.get(userReaction ? `audience-${userReaction.toLowerCase()}` : 'audience-reactbutton')}
            iconLeft={userReaction ? userReaction.toLowerCase() : 'ui-reaction'}
            contentColor={theme.palette.grey.black}
            style={styles.button}
            testID="button-reaction"
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default React.memo(AudienceReactButton);
