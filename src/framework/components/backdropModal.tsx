import * as React from "react";
import { TouchableWithoutFeedback, View } from "react-native";
import Modal from "react-native-modal";

import theme from "../util/theme";

export interface IBackdropModalProps {
  content: JSX.Element;
  contentMustScroll: boolean;
  contentStyle: object;
  handleClose: () => void;
  handleOpen: () => void;
  visible: boolean;
}

export const BackdropModal = ({
  content,
  contentMustScroll,
  contentStyle,
  handleOpen,
  handleClose,
  visible,
}: IBackdropModalProps) => (
  <Modal
    backdropOpacity={0.5}
    coverScreen
    isVisible={visible}
    onBackdropPress={handleClose}
    onSwipeComplete={handleClose}
    onSwipeStart={handleOpen}
    propagateSwipe={contentMustScroll}
    style={{
      justifyContent: "flex-end",
      margin: 0,
    }}
    swipeDirection={["down"]}
    useNativeDriverForBackdrop>
    <View style={[{}, contentStyle]}>
      <View
        style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.color.tertiary.light,
        }}>
        <View
          style={{
            width: 50,
            height: 5,
            borderRadius: 5,
            backgroundColor: theme.color.tertiary.regular,
          }}
        />
      </View>
      {contentMustScroll ? <TouchableWithoutFeedback>{content}</TouchableWithoutFeedback> : content}
    </View>
  </Modal>
);
