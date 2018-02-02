import styled from "glamorous-native"
import NativeModal from "react-native-modal"
import { CommonStyles } from "../styles/common/styles"
import { layoutSize } from "../constants/layoutSize"

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
	paddingHorizontal: layoutSize.LAYOUT_20,
	paddingVertical: layoutSize.LAYOUT_32,
	shadowColor: CommonStyles.shadowColor,
	shadowOffset: CommonStyles.shadowOffset,
	shadowOpacity: CommonStyles.shadowOpacity,
	shadowRadius: CommonStyles.shadowRadius,
})
