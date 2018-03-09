import style from "glamorous-native"
import * as React from "react";
import { CommonStyles } from "../../styles/common/styles"
import { ViewStyle, Platform, TouchableOpacity } from 'react-native';
import { isIphoneX } from "react-native-iphone-x-helper"
import { Icon } from "..";

const iosStatusBarHeight = isIphoneX() ? 40 : 20

const containerBar: ViewStyle = {
	alignItems: "center",
	elevation: 5,
	flexDirection: "row",
	flexWrap: "wrap",
	justifyContent: "flex-start",
	paddingTop: Platform.OS === "ios" ? iosStatusBarHeight : 0,
}

export const Header = style.view({
	...containerBar,
	backgroundColor: CommonStyles.mainColorTheme
})

const sensitiveStylePanel: ViewStyle = {
	alignItems: "center",
	height: 56,
	justifyContent: "center",
	paddingLeft: 20,
	paddingRight: 10,
	width: 58,
}

const iconsDeltaSizes = {
	close: 16
}

export const HeaderIcon = ({ name, hidden, onPress }: { name: string, hidden?: boolean, onPress?: () => void }) => (
	<TouchableOpacity style={ sensitiveStylePanel } onPress={ () => onPress() }>
		<Icon size={ iconsDeltaSizes[name] ? iconsDeltaSizes[name] : 20 } name={ name } color={ hidden ? "transparent" : "#FFFFFF" } />
	</TouchableOpacity>
);

export const TouchableEndBarPanel = style.touchableOpacity({
	...sensitiveStylePanel,
	alignSelf: "flex-end",
})

export const CenterPanel = style.touchableOpacity({
	alignItems: "center",
	flex: 1,
	height: 56,
	justifyContent: "center",
})

export const AppTitle = style.text({
	color: "white",
	fontFamily: CommonStyles.primaryFontFamily,
	fontWeight: "400",
	fontSize: 16,
	flex: 1,
	textAlign: 'center'
});

export const HeaderAction = style.text({
	color: "white",
	fontFamily: CommonStyles.primaryFontFamily,
	fontWeight: "400",
	flex: 1,
	textAlign: 'right',
	paddingRight: 20,
	height: 56,
	lineHeight: 56
});

export const Title = style.text(
	{
		color: "white",
		fontFamily: CommonStyles.primaryFontFamily,
		fontWeight: "400",
		textAlign: 'left'
	},
	({ smallSize = false }) => ({
		fontSize: smallSize ? 12 : 16,
	})
);

export const SubTitle = style.text(
	{
		color: "white",
		fontFamily: CommonStyles.primaryFontFamily,
		fontWeight: "400",
		fontSize: 12,
		opacity: 0.5
	}
)
