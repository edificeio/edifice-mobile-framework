import React, { useCallback, useEffect } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

import styles from './styles';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { MailsRecipientContainerProps } from '~/framework/modules/mails/components/recipient-item';
import { MailsVisible } from '~/framework/modules/mails/model';
import { mailsService } from '~/framework/modules/mails/service';

const MailsRecipientContainer = (props: React.PropsWithChildren<MailsRecipientContainerProps>) => {
  const opacityView = React.useRef(new Animated.Value(0)).current;
  const positionXIcon = React.useRef(new Animated.Value(30)).current;
  const opacityIcon = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (props.selected) {
      Animated.timing(opacityView, {
        duration: 100,
        toValue: 0.7,
        useNativeDriver: true,
      }).start(() => {
        Animated.parallel([
          Animated.timing(positionXIcon, {
            duration: 130,
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacityIcon, {
            duration: 130,
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [opacityIcon, opacityView, positionXIcon, props.selected]);

  const onPress = async () => {
    if (!props.onPress) return;
    if (props.item.type === 'ShareBookmark') {
      try {
        const items = await mailsService.bookmark.getById({ id: props.item.id });
        props.onPress(items as MailsVisible[]);
      } catch (e) {
        console.error('Error while opening share bookmark', e);
      }
    } else {
      props.onPress([props.item] as MailsVisible[]);
    }
  };

  const renderIconIsSelected = useCallback(() => {
    if (!props.selected) return null;
    return (
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
    );
  }, [opacityIcon, opacityView, positionXIcon, props.selected]);

  return (
    <TouchableOpacity disabled={props.onPress && !props.selected ? false : true} onPress={onPress}>
      {renderIconIsSelected()}
      <View style={[styles.container, props.selected ? styles.containerSelected : {}]}>{props.children}</View>
    </TouchableOpacity>
  );
};

export default MailsRecipientContainer;
