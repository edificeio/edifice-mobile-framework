import styled from "glamorous-native"
import NativeModal from "react-native-modal"
import { CommonStyles } from "../styles/common/styles";

export const ModalBox = styled(NativeModal)({
	alignItems: "center",
	justifyContent: "center",
})

export const ModalContent = styled.view({
	alignItems: "center",
	alignSelf: "center",
	backgroundColor: "white",
	borderRadius: 4,
	elevation: CommonStyles.elevation,
	justifyContent: "center",
	paddingHorizontal: 20,
	paddingVertical: 32,
	shadowColor: CommonStyles.shadowColor,
	shadowOffset: CommonStyles.shadowOffset,
	shadowOpacity: CommonStyles.shadowOpacity,
	shadowRadius: CommonStyles.shadowRadius,
})
