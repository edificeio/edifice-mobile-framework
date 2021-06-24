import * as React from "react";
import { TouchableWithoutFeedback, View } from "react-native";
import Modal from "react-native-modal";

import theme from "../util/theme";
import { TextBold } from "./text";

export interface IBackdropModalProps {
  content: JSX.Element;
  contentStyle: StyleProp<ViewStyle>;
  handleClose: () => void;
  handleOpen: () => void;
  headerColor?: colorValue;
  indicatorColor?: colorValue;
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
      justifyContent: "flex-end",
      margin: 0,
    }}
    swipeDirection={["down"]}
    useNativeDriverForBackdrop>
    <View style={[{}, contentStyle]}>
      <View
        style={{
          alignItems: "center",
          backgroundColor: headerColor || theme.color.tertiary.light,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 40,
          justifyContent: "center",
        }}>
        <View
          style={{
            backgroundColor: indicatorColor || theme.color.tertiary.regular,
            borderRadius: 5,
            height: 5,
            width: 40,
          }}
        />
      </View>
      {title ? (
        <View
          style={{
            alignItems: "center",
            backgroundColor: headerColor || theme.color.tertiary.light,
            height: 60,
            justifyContent: "center",
            paddingBottom: 20,
          }}>
          <TextBold>{title}</TextBold>
        </View>
      ) : null}
      {propagateSwipe ? <TouchableWithoutFeedback>{content}</TouchableWithoutFeedback> : content}
    </View>
  </Modal>
);
