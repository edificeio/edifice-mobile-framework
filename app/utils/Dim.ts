import { Dimensions } from "react-native"

const hires = Dimensions.get("window").width > 340

export const screenWidth = Dimensions.get("window").width

const imageWidth = Math.round(Dimensions.get("window").width / 2)
const imageHeight = Math.round(Dimensions.get("window").height / 2)

export const size = {
	large: {
		container: Math.round(imageWidth * 0.82),
		image: Math.round(imageWidth * 0.3),
		margin: Math.round(imageHeight * 0.26),
	},
	small: {
		container: Math.round(imageWidth * 0.4),
		image: hires ? Math.round(imageWidth * 0.3) : Math.round(imageWidth * 0.15),
		margin: hires ? Math.round(imageHeight * 0.1) : Math.round(imageHeight * 0.05),
	},
}
