import * as React from 'react';
import { Animated, TouchableOpacity } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import { NamedSVG } from '~/framework/components/picture';
import { AudienceReactionType } from '~/framework/modules/core/audience/types';
import { audienceReactionsInfos, validReactionTypes } from '~/framework/modules/core/audience/util';

import styles from './styles';
import { AudienceReactButtonProps } from './types';

const AudienceReactButton = (props: AudienceReactButtonProps) => {
  const { userReaction } = props;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const opacityBlocReactions = React.useRef(new Animated.Value(0)).current;
  const animationReactions = {
    [AudienceReactionType.REACTION_1]: {
      transform: React.useRef(new Animated.Value(-100)).current,
      opacity: React.useRef(new Animated.Value(0)).current,
    },
    [AudienceReactionType.REACTION_2]: {
      transform: React.useRef(new Animated.Value(-100)).current,
      opacity: React.useRef(new Animated.Value(0)).current,
    },
    [AudienceReactionType.REACTION_3]: {
      transform: React.useRef(new Animated.Value(-100)).current,
      opacity: React.useRef(new Animated.Value(0)).current,
    },
    [AudienceReactionType.REACTION_4]: {
      transform: React.useRef(new Animated.Value(-100)).current,
      opacity: React.useRef(new Animated.Value(0)).current,
    },
  };

  const showReactions = () => {
    setIsOpen(true);
    Animated.timing(opacityBlocReactions, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
    validReactionTypes.forEach((reaction, index) => {
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
    validReactionTypes.forEach((reaction, index) => {
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
    if (!isOpen) showReactions();
    else hideReactions();
  };

  const deleteReaction = () => {
    props.deleteReaction();

    if (isOpen) hideReactions();
  };

  const postReaction = (reaction: AudienceReactionType) => {
    if (userReaction) props.postReaction(reaction);
    else props.updateReaction(reaction);

    hideReactions();
  };

  const renderReactButton = () => {
    if (userReaction) {
      return (
        <DefaultButton
          text={audienceReactionsInfos[userReaction].label}
          iconLeft={audienceReactionsInfos[userReaction].icon}
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
          text={I18n.get('audiencemeasurement-reactbutton')}
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
          {validReactionTypes.map(reaction => (
            <Animated.View
              key={reaction}
              style={{
                transform: [{ translateY: animationReactions[reaction].transform }],
                opacity: animationReactions[reaction].opacity,
              }}>
              <TouchableOpacity onPress={() => postReaction(reaction)}>
                <NamedSVG name={audienceReactionsInfos[reaction].icon} width={30} height={30} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      )}
      {renderReactButton()}
    </>
  );
};

export default AudienceReactButton;
