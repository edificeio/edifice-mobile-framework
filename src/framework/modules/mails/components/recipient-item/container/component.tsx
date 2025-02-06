import React, { useEffect } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

import { MailsRecipientContainerProps } from '~/framework/modules/mails/components/recipient-item';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { MailsVisible } from '~/framework/modules/mails/model';
import styles from './styles';

const MailsRecipientContainer = (props: React.PropsWithChildren<MailsRecipientContainerProps>) => {
  const opacityView = React.useRef(new Animated.Value(0)).current;
  const positionXIcon = React.useRef(new Animated.Value(30)).current;
  const opacityIcon = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (props.selected) {
      Animated.timing(opacityView, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }).start(() => {
        Animated.parallel([
          Animated.timing(positionXIcon, {
            toValue: 0,
            duration: 130,
            useNativeDriver: true,
          }),
          Animated.timing(opacityIcon, {
            toValue: 1,
            duration: 130,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [props.selected]);

  const onPress = () => {
    if (props.onPress) props.onPress(props.item as MailsVisible);
  };

  return (
    <TouchableOpacity disabled={props.onPress && !props.selected ? false : true} onPress={onPress}>
      {props.selected ? (
        <Animated.View style={[styles.selectedView, { opacity: opacityView }]}>
          <Animated.View style={{ opacity: opacityIcon, transform: [{ translateX: positionXIcon }] }}>
            <Svg
              name="ui-success"
              fill={theme.palette.grey.graphite}
              height={UI_SIZES.elements.icon.small}
              width={UI_SIZES.elements.icon.small}
            />
          </Animated.View>
        </Animated.View>
      ) : null}
      <View style={[styles.container, props.selected ? styles.containerSelected : {}]}>{props.children}</View>
    </TouchableOpacity>
  );
};

export default MailsRecipientContainer;
