import { Dimensions, StyleSheet } from "react-native"

const hires = Dimensions.get("window").width > 340

const imageWidth = Math.round(Dimensions.get("window").width / 2)
const imageHeight = Math.round(Dimensions.get("window").height / 2)

export const largeContainerSize = Math.round(imageWidth * 0.9)
export const largeImageSize = Math.round(imageWidth * 0.3)
export const marginTopLargeContainerSize = Math.round(imageHeight * 0.2)
export const marginTopSmallContainerSize = hires ? Math.round(imageHeight * 0.1) : Math.round(imageHeight * 0.05)
export const smallContainerSize = Math.round(imageWidth * 0.4)
export const smallImageSize = hires ? largeImageSize : Math.round(imageWidth * 0.15)

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
		tintColor: "#2A9CC8",
	},
})
