import style from "glamorous-native"
import * as React from "react";
import { CommonStyles } from "../styles/common/styles"

const ViewNB = style.view({
	alignItems: "center",
	alignSelf: "flex-end",
	backgroundColor: CommonStyles.mainColorTheme,
	borderRadius: 10,
	height: 18,
	justifyContent: "center",
	marginBottom: 7,
	marginRight: 4,
	width: 18
})

const ViewEmpty = style.view({
	height: 16,
	marginBottom: 7,
})

const Text = style.text({
	color: "white",
	fontSize: 10,
	fontFamily: CommonStyles.primaryFontFamilyLight,
})

export const CircleNumber = ({ nb }) => {
	if (nb === 0) {
		return <ViewEmpty />
	}

	return (
		<ViewNB>
			<Text>{nb}</Text>
		</ViewNB>
	)
}
