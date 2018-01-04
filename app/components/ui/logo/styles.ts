import { Dimensions, StyleSheet } from "react-native"

const imageWidth = Math.round(Dimensions.get("window").width / 2)

export const smallContainerSize = Math.round(imageWidth / 3)
export const marginTopSmallContainerSize = Math.round(imageWidth / 20)
export const smallImageSize = Math.round(imageWidth / 5)
export const largeContainerSize = Math.round(imageWidth)
export const marginTopLargeContainerSize = Math.round(imageWidth / 3)
export const largeImageSize = Math.round(imageWidth / 3)

export default StyleSheet.create({
	container: {
		alignItems: "center",
		marginTop: 0,
	},
	containerImage: {
		alignItems: "center",
		justifyContent: "center",
		width: largeContainerSize,
		height: largeContainerSize,
	},
	marginTopContainerImage: {
		alignItems: "center",
		justifyContent: "center",
		width: largeContainerSize,
		height: marginTopLargeContainerSize,
	},
	logo: {
		width: largeImageSize,
		tintColor: "#0096ca",
	},
	text: {
		color: "#ffffff",
		fontSize: 28,
		letterSpacing: -0.5,
		marginTop: 15,
		fontWeight: "600",
	},
})
