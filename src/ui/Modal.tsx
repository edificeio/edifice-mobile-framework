import styled from "glamorous-native";
import NativeModal from "react-native-modal";
import { CommonStyles } from "../styles/common/styles";
import { LightP } from "./Typography";

export const ModalBox = styled(NativeModal)({
  alignItems: "stretch"
  // debug below
  // backgroundColor: "red"
});

export const ModalContent = styled.view({
  alignItems: "center",
  alignSelf: "center",
  backgroundColor: "white",
  borderRadius: 4,
  elevation: CommonStyles.elevation,
  flex: 0,
  justifyContent: "center",
  paddingTop: 35,
  shadowColor: CommonStyles.shadowColor,
  shadowOffset: CommonStyles.shadowOffset,
  shadowOpacity: CommonStyles.shadowOpacity,
  shadowRadius: CommonStyles.shadowRadius,
  width: 270
});

export const ModalContentBlock = styled.view({
  alignItems: "stretch",
  flex: 0,
  flexGrow: 0,
  marginBottom: 35,
  marginHorizontal: 20
});

export const ModalContentText = styled(LightP)({
  textAlign: "center"
});
