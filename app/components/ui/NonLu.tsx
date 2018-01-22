import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../../constants/layoutSize"
import { CommonStyles } from "../styles/common/styles"

const ViewNB = style.view({
	alignItems: "center",
	alignSelf: "flex-end",
	backgroundColor: CommonStyles.mainColorTheme,
	borderRadius: layoutSize.LAYOUT_10,
	height: layoutSize.LAYOUT_18,
	justifyContent: "center",
	marginBottom: layoutSize.LAYOUT_7,
	marginRight: layoutSize.LAYOUT_4,
	width: layoutSize.LAYOUT_18,
})

const ViewEmpty = style.view({
	height: layoutSize.LAYOUT_16,
	marginBottom: layoutSize.LAYOUT_7,
})

const Text = style.text({
	color: "white",
	fontSize: layoutSize.LAYOUT_10,
	fontFamily: CommonStyles.primaryFontFamilyLight,
})

export const NonLu = ({ nb }) => {
	if (nb === 0) {
		return <ViewEmpty />
	}

	return (
		<ViewNB>
			<Text>{nb}</Text>
		</ViewNB>
	)
}
