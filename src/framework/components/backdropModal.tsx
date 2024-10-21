import * as React from 'react';
import { ColorValue, StyleProp, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';

import Modal from 'react-native-modal';

import { UI_SIZES } from './constants';
import { SmallBoldText } from './text';

import theme from '~/app/theme';

export interface IBackdropModalProps {
  content: JSX.Element;
  contentStyle: StyleProp<ViewStyle>;
  handleClose: () => void;
  handleOpen: () => void;
  headerColor?: ColorValue;
  indicatorColor?: ColorValue;
  propagateSwipe: boolean;
  title?: string;
  visible: boolean;
}

export const BackdropModal = ({
  content,
  contentStyle,
  handleClose,
  handleOpen,
  headerColor,
  indicatorColor,
  propagateSwipe,
  title,
  visible,
}: IBackdropModalProps) => (
  <Modal
    backdropOpacity={0.5}
    coverScreen
    isVisible={visible}
    onBackdropPress={handleClose}
    onSwipeComplete={handleClose}
    onSwipeStart={handleOpen}
    propagateSwipe={propagateSwipe}
    style={{
      justifyContent: 'flex-end',
      margin: 0,
    }}
    swipeDirection={['down']}>
    <View style={[{}, contentStyle]}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: headerColor || theme.palette.grey.fog,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 40,
          justifyContent: 'center',
        }}>
        <View
          style={{
            backgroundColor: indicatorColor || theme.ui.text.light,
            borderRadius: 5,
            height: 5,
            width: 40,
          }}
        />
      </View>
      {title ? (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: headerColor || theme.palette.grey.fog,
            height: 60,
            justifyContent: 'center',
            paddingBottom: UI_SIZES.spacing.medium,
          }}>
          <SmallBoldText>{title}</SmallBoldText>
        </View>
      ) : null}
      {propagateSwipe ? <TouchableWithoutFeedback>{content}</TouchableWithoutFeedback> : content}
    </View>
  </Modal>
);
