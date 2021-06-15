import * as React from "react";
import { View } from "react-native";
import { Backdrop } from "react-native-backdrop";
import theme from "../util/theme";

export interface IBackdropModalProps {
  content: JSX.Element;
  visible: boolean;
  handleOpen: () => void;
  handleClose: () => void;
}

export const BackdropModal = ({content, visible, handleOpen, handleClose}: IBackdropModalProps) => (
  <Backdrop
    visible={visible}
    handleOpen={handleOpen}
    handleClose={handleClose}
    swipeConfig={{
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    }}
    animationConfig={{
      speed: 14,
      bounciness: 4,
    }}
    containerStyle={{height: "90%"}}
    overlayColor="rgba(0,0,0,0.5)"
    header={
      <View
        style={{
          height: 40,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.color.tertiary.light
        }}
      >
        <View
          style={{
            width: 50,
            height: 5,
            borderRadius: 5,
            backgroundColor: theme.color.tertiary.regular
          }}
        />
      </View>
    }
  >
    {content}
  </Backdrop>
);
