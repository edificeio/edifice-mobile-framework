import * as React from 'react';
import { Animated, View } from 'react-native';

import { GestureDetector, useExclusiveGestures, usePanGesture, useTapGesture } from 'react-native-gesture-handler';

import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import Feedback from '~/framework/util/feedback/feedback';
import type { AudienceRect } from '~/modules/audience/model';
import { I18n } from '~/util/i18n';

import styles from './styles';
import type { AudienceReactButtonProps } from './types';

const LONG_PRESS_DELAY = 300;
/** Beyond, the touch is a scroll, not a press (the pan of the long press fails at the same distance). */
const TAP_MAX_DISTANCE = 10;

/**
 * The button to react to a resource.
 * - A long press opens the picker of reactions (`onPickReaction`); the finger can go on to a reaction and leave the screen there to
 *   choose it: the touch stays with the button, which gives its moves to the picker (`onGestureMove`, `onGestureRelease`). The page
 *   does not scroll meanwhile.
 * - A press removes the reaction of the user, or opens the picker if there is none.
 */
const AudienceReactButton = ({
  onDeleteReaction,
  onGestureMove,
  onGestureRelease,
  onPickReaction,
  onPostReaction,
  onUpdateReaction,
  userReaction,
}: Readonly<AudienceReactButtonProps>) => {
  const viewRef = React.useRef<React.ComponentRef<typeof View>>(null);
  const anchorRef = React.useRef<AudienceRect | undefined>(undefined);
  const isPickerOpenRef = React.useRef(false);
  const scale = React.useRef(new Animated.Value(1)).current;

  const animateButton = React.useCallback(() => {
    Animated.sequence([
      Animated.timing(scale, { duration: 150, toValue: 1.5, useNativeDriver: true }),
      Animated.timing(scale, { duration: 150, toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [scale]);

  const openPicker = React.useCallback(async () => {
    if (isPickerOpenRef.current || !anchorRef.current) return;
    isPickerOpenRef.current = true;
    Feedback.actionDone();
    try {
      const reaction = await onPickReaction(anchorRef.current);
      if (!reaction) return;
      Feedback.actionDone();
      // ToDo(audience-migration): `POST` when the user already reacted, `PUT` otherwise: looks inverted, kept as is (fiche §6, 8).
      if (userReaction) onPostReaction(reaction);
      else onUpdateReaction(reaction);
      // The picker is gone (its animations are over): the button shows the reaction at once.
      animateButton();
    } finally {
      isPickerOpenRef.current = false;
    }
  }, [animateButton, onPickReaction, onPostReaction, onUpdateReaction, userReaction]);

  const deleteReaction = React.useCallback(() => {
    Feedback.actionDone();
    onDeleteReaction();
    animateButton();
  }, [animateButton, onDeleteReaction]);

  const measureAnchor = React.useCallback(() => {
    viewRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      anchorRef.current = { height, width, x: pageX, y: pageY };
    });
  }, []);

  // Native gestures, not the JS responder (`PanResponder`): a JS responder does not stop the scroll view that contains it, an active
  // native gesture does. A pan that activates after a long press, not a long press: a long press is cancelled as soon as the finger
  // goes further than a few points. If the finger moves before the delay, the pan fails and the page scrolls as usual.
  const holdAndDrag = usePanGesture({
    activateAfterLongPress: LONG_PRESS_DELAY,
    onActivate: openPicker,
    onBegin: measureAnchor,
    onFinalize: onGestureRelease,
    onUpdate: event => onGestureMove({ x: event.absoluteX, y: event.absoluteY }),
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
    <GestureDetector gesture={gesture}>
      <Animated.View ref={viewRef} style={animatedStyle}>
        <DefaultButton
          text={I18n.get(userReaction ? `audience-${userReaction.toLowerCase()}` : 'audience-reactbutton')}
          iconLeft={userReaction ? userReaction.toLowerCase() : 'ui-reaction'}
          contentColor={theme.palette.grey.black}
          style={styles.button}
          testID="button-reaction"
        />
      </Animated.View>
    </GestureDetector>
  );
};

export default React.memo(AudienceReactButton);
