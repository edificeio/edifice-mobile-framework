import { Dimensions, StyleSheet } from "react-native"

const hires = Dimensions.get("window").width > 340

const imageWidth = Math.round(Dimensions.get("window").width / 2)

export const smallContainerSize = Math.round(imageWidth / 4)
export const marginTopSmallContainerSize = hires? Math.round(imageWidth / 8) : Math.round(imageWidth / 40)
export const largeImageSize = Math.round(imageWidth * 3 / 10)
export const smallImageSize = hires ? largeImageSize : Math.round(imageWidth / 6)
export const largeContainerSize = Math.round(imageWidth)
export const marginTopLargeContainerSize = Math.round(imageWidth * 5 / 12)


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
	text: {
		color: "#ffffff",
		fontSize: 28,
		letterSpacing: -0.5,
		marginTop: 15,
		fontWeight: "600",
	},
})
