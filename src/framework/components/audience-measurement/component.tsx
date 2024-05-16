import React from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';

import styles from './styles';
import { AudienceMeasurementProps } from './types';

const AudienceMeasurement = (props: AudienceMeasurementProps) => {
  const reactionsOpacity = React.useRef(new Animated.Value(0)).current;
  const reactionsYPos = React.useRef(new Animated.Value(0)).current;
  const scaleItem = React.useRef(new Animated.Value(1)).current;

  const animateReactions = React.useCallback(
    ({ opacity, ypos }: { opacity: number; ypos: number }) => {
      Animated.parallel([
        Animated.timing(reactionsOpacity, {
          toValue: opacity,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(reactionsYPos, {
          toValue: ypos,
          duration: 100,
          useNativeDriver: false,
        }),
      ]).start();
    },
    [reactionsOpacity, reactionsYPos],
  );

  const animateItem = React.useCallback(
    ({ scale }: { scale: number }) => {
      Animated.parallel([
        Animated.timing(scaleItem, {
          toValue: scale,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    },
    [scaleItem],
  );
  return (
    <View style={props.containerStyle}>
      <View style={styles.stats}>
        <TouchableOpacity onPress={props.actionReactions} style={styles.statsItem}>
          <SmallText style={styles.statsItemText}>7</SmallText>
          <View style={styles.statsReactions}>
            <NamedSVG
              name="reaction-thankyou-round"
              height={UI_SIZES.elements.icon.default}
              width={UI_SIZES.elements.icon.default}
            />
            <NamedSVG
              name="reaction-awesome-round"
              height={UI_SIZES.elements.icon.default}
              width={UI_SIZES.elements.icon.default}
            />
            <NamedSVG
              name="reaction-welldone-round"
              height={UI_SIZES.elements.icon.default}
              width={UI_SIZES.elements.icon.default}
            />
            <NamedSVG
              name="reaction-instructive-round"
              height={UI_SIZES.elements.icon.default}
              width={UI_SIZES.elements.icon.default}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={props.actionViews} style={styles.statsItem}>
          <SmallText style={styles.statsItemText}>48</SmallText>
          <NamedSVG
            name="ui-see"
            fill={theme.palette.grey.graphite}
            height={UI_SIZES.elements.icon.small}
            width={UI_SIZES.elements.icon.small}
          />
        </TouchableOpacity>
        <View style={styles.statsItem}>
          <SmallText style={styles.statsItemText}>6</SmallText>
          <NamedSVG
            name="ui-messageInfo"
            fill={theme.palette.grey.graphite}
            height={UI_SIZES.elements.icon.small}
            width={UI_SIZES.elements.icon.small}
          />
        </View>
      </View>
      <Animated.View style={[styles.reactions, { transform: [{ translateY: reactionsYPos }], opacity: reactionsOpacity }]}>
        <TouchableOpacity onLongPress={() => animateItem({ scale: 2 })}>
          <Animated.View style={{ transform: [{ scale: scaleItem }] }}>
            <NamedSVG name="reaction-thankyou" />
          </Animated.View>
        </TouchableOpacity>

        <NamedSVG name="reaction-welldone" />
        <NamedSVG name="reaction-awesome" />
        <NamedSVG name="reaction-instructive" />
      </Animated.View>
      <DefaultButton
        text="Réagir"
        iconLeft="ui-reaction"
        contentColor={theme.palette.grey.black}
        style={styles.button}
        onLongPress={() => animateReactions({ opacity: 1, ypos: -UI_SIZES.spacing.minor })}
        onPressOut={() => animateReactions({ opacity: 0, ypos: 0 })}
        pressRetentionOffset={{ top: 20, left: 20, right: 20, bottom: 20 }}
      />
    </View>
  );
};

export default AudienceMeasurement;
