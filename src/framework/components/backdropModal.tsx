import * as React from 'react';
import { ColorValue, StyleProp, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import Modal from 'react-native-modal';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';
import { TextBold } from './text';

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
  handleOpen,
  handleClose,
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
    swipeDirection={['down']}
    useNativeDriverForBackdrop>
    <View style={[{}, contentStyle]}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: headerColor || theme.legacy.neutral.extraLight,
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
            backgroundColor: headerColor || theme.legacy.neutral.extraLight,
            height: 60,
            justifyContent: 'center',
            paddingBottom: UI_SIZES.spacing.medium,
          }}>
          <TextBold>{title}</TextBold>
        </View>
      ) : null}
      {propagateSwipe ? <TouchableWithoutFeedback>{content}</TouchableWithoutFeedback> : content}
    </View>
  </Modal>
);
