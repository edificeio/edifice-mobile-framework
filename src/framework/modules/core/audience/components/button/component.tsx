import * as React from 'react';
import { Animated, Modal, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { getValidReactionTypes } from '~/framework/modules/auth/reducer';
import Feedback from '~/framework/util/feedback/feedback';

import styles from './styles';
import { AudienceReactButtonAllProps } from './types';

const REACTION_ICON_SIZE = 30;
const HEIGHT_VIEW_REACTIONS = REACTION_ICON_SIZE + UI_SIZES.spacing.medium * 2;

const AudienceReactButton = (props: AudienceReactButtonAllProps) => {
  const { userReaction } = props;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [offsetY, setOffsetY] = React.useState(0);
  const [offsetX, setOffsetX] = React.useState(0);

  let component = React.useRef(null);

  const opacityBlocReactions = React.useRef(new Animated.Value(0)).current;
  const animationReactions = props.validReactionTypes.reduce((acc, reaction) => {
    acc[reaction] = {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      transform: React.useRef(new Animated.Value(-100)).current,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      opacity: React.useRef(new Animated.Value(0)).current,
    };
    return acc;
  }, {});

  const showReactions = () => {
    setIsOpen(true);
    Animated.timing(opacityBlocReactions, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
    props.validReactionTypes.forEach((reaction, index) => {
      Animated.parallel([
        Animated.timing(animationReactions[reaction].transform, {
          toValue: 0,
          duration: 150,
          delay: 50 * index,
          useNativeDriver: true,
        }),
        Animated.timing(animationReactions[reaction].opacity, {
          toValue: 1,
          duration: 150,
          delay: 50 * index,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const hideReactions = () => {
    Feedback.actionDone();
    props.validReactionTypes.forEach((reaction, index) => {
      Animated.parallel([
        Animated.timing(animationReactions[reaction].transform, {
          toValue: -100,
          duration: 150,
          delay: 50 * index,
          useNativeDriver: true,
        }),
        Animated.timing(animationReactions[reaction].opacity, {
          toValue: 0,
          duration: 150,
          delay: 50 * index,
          useNativeDriver: true,
        }),
      ]).start();
    });
    setTimeout(() => {
      Animated.timing(opacityBlocReactions, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }, 200);
    setTimeout(() => setIsOpen(false), 400);
  };

  const openReactions = () => {
    component.measure((fx, fy, width, height, px, py) => {
      setOffsetY(UI_SIZES.elements.navbarHeight + HEIGHT_VIEW_REACTIONS < py ? py - HEIGHT_VIEW_REACTIONS - 10 : py + height + 10);
      setOffsetX(px);
    });
    Feedback.actionDone();
    if (!isOpen) showReactions();
    else hideReactions();
  };

  const deleteReaction = () => {
    Feedback.actionDone();
    props.deleteReaction();

    if (isOpen) hideReactions();
  };

  const postReaction = (reaction: string) => {
    Feedback.actionDone();
    if (userReaction) props.postReaction(reaction);
    else props.updateReaction(reaction);

    hideReactions();
  };

  const renderReactButton = () => {
    if (userReaction) {
      return (
        <DefaultButton
          text={I18n.get(`audience-${userReaction.toLowerCase()}`)}
          iconLeft={userReaction.toLowerCase()}
          contentColor={theme.palette.grey.black}
          style={styles.button}
          action={deleteReaction}
          onLongPress={openReactions}
          delayLongPress={100}
        />
      );
    } else
      return (
        <DefaultButton
          text={I18n.get('audience-reactbutton')}
          iconLeft="ui-reaction"
          contentColor={theme.palette.grey.black}
          style={styles.button}
          action={openReactions}
          onLongPress={openReactions}
          delayLongPress={0}
        />
      );
  };
  return (
    <View ref={view => (component = view)}>
      <Modal transparent animationType="fade" visible={isOpen} onRequestClose={hideReactions}>
        <TouchableOpacity style={styles.flex1} activeOpacity={1} onPress={hideReactions}>
          <Animated.View style={[styles.reactions, { opacity: opacityBlocReactions, left: offsetX, top: offsetY }]}>
            {props.validReactionTypes.map(reaction => (
              <Animated.View
                key={reaction}
                style={{
                  transform: [{ translateY: animationReactions[reaction].transform }],
                  opacity: animationReactions[reaction].opacity,
                }}>
                <TouchableOpacity onPress={() => postReaction(reaction)}>
                  <NamedSVG name={reaction.toLowerCase()} width={REACTION_ICON_SIZE} height={REACTION_ICON_SIZE} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
      {renderReactButton()}
    </View>
  );
};

export default connect(() => ({
  validReactionTypes: getValidReactionTypes(),
}))(AudienceReactButton);
