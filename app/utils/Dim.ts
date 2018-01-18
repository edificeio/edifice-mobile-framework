import { Dimensions } from "react-native"

const hires = Dimensions.get("window").width > 340

export const screenWidth = Dimensions.get("window").width

const imageWidth = Math.round(Dimensions.get("window").width / 2)
const imageHeight = Math.round(Dimensions.get("window").height / 2)

export const size = {
	small: {
		container: Math.round(imageWidth * 0.4),
		margin: hires ? Math.round(imageHeight * 0.1) : Math.round(imageHeight * 0.05),
		image: hires ? Math.round(imageWidth * 0.3) : Math.round(imageWidth * 0.15),
	},
	large: {
		container: Math.round(imageWidth * 0.82),
		margin: Math.round(imageHeight * 0.26),
		image: Math.round(imageWidth * 0.3),
	},
}
