import * as React from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import { NamedSVG } from '~/framework/components/picture';
import { getValidReactionTypes } from '~/framework/modules/auth/reducer';
import Feedback from '~/framework/util/feedback/feedback';

import styles from './styles';
import { AudienceReactButtonAllProps } from './types';

const AudienceReactButton = (props: AudienceReactButtonAllProps) => {
  const { userReaction } = props;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

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
    Feedback.actionDone();
    if (!isOpen) showReactions();
    else hideReactions();
  };

  const deleteReaction = () => {
    props.deleteReaction();

    if (isOpen) hideReactions();
  };

  const postReaction = (reaction: string) => {
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
          delayLongPress={150}
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
          delayLongPress={150}
        />
      );
  };
  return (
    <>
      {isOpen && (
        <Animated.View style={[styles.reactions, { opacity: opacityBlocReactions }]}>
          {props.validReactionTypes.map(reaction => (
            <Animated.View
              key={reaction}
              style={{
                transform: [{ translateY: animationReactions[reaction].transform }],
                opacity: animationReactions[reaction].opacity,
              }}>
              <TouchableOpacity onPress={() => postReaction(reaction)}>
                <NamedSVG name={reaction.toLowerCase()} width={30} height={30} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      )}
      {renderReactButton()}
    </>
  );
};

export default connect(state => ({
  validReactionTypes: getValidReactionTypes(),
}))(AudienceReactButton);
