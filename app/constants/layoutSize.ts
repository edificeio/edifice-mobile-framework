import { PixelRatio, Dimensions } from "react-native"
const { width } = Dimensions.get("window")

var pixelRatio = PixelRatio.get()

const getPixelSize = size => {
	if (pixelRatio <= 1.5) return size * 1.2

	if (pixelRatio <= 2) {
		return size * 1.4
	}
	if (pixelRatio <= 3) {
		return size * 1.8
	}
	return size * 2
}

const guidelineBaseWidth = 350

export const scale = size => width / guidelineBaseWidth * getPixelSize(size)

const getPixelSizeForLayoutSize = size => {
	return scale(size)
}

export const layoutSize = {
	LAYOUT_MOINS_2: getPixelSizeForLayoutSize(-2),
	LAYOUT_0: getPixelSizeForLayoutSize(0),
	LAYOUT_1: getPixelSizeForLayoutSize(1),
	LAYOUT_2: getPixelSizeForLayoutSize(2),
	LAYOUT_3: getPixelSizeForLayoutSize(3),
	LAYOUT_4: getPixelSizeForLayoutSize(4),
	LAYOUT_5: getPixelSizeForLayoutSize(5),
	LAYOUT_6: getPixelSizeForLayoutSize(6),
	LAYOUT_7: getPixelSizeForLayoutSize(7),
	LAYOUT_8: getPixelSizeForLayoutSize(8),
	LAYOUT_9: getPixelSizeForLayoutSize(9),
	LAYOUT_10: getPixelSizeForLayoutSize(10),
	LAYOUT_11: getPixelSizeForLayoutSize(11),
	LAYOUT_12: getPixelSizeForLayoutSize(12),
	LAYOUT_13: getPixelSizeForLayoutSize(13),
	LAYOUT_14: getPixelSizeForLayoutSize(14),
	LAYOUT_15: getPixelSizeForLayoutSize(15),
	LAYOUT_16: getPixelSizeForLayoutSize(16),
	LAYOUT_18: getPixelSizeForLayoutSize(18),
	LAYOUT_20: getPixelSizeForLayoutSize(20),
	LAYOUT_22: getPixelSizeForLayoutSize(22),
	LAYOUT_23: getPixelSizeForLayoutSize(23),
	LAYOUT_24: getPixelSizeForLayoutSize(24),
	LAYOUT_25: getPixelSizeForLayoutSize(25),
	LAYOUT_28: getPixelSizeForLayoutSize(28),
	LAYOUT_30: getPixelSizeForLayoutSize(30),
	LAYOUT_31: getPixelSizeForLayoutSize(31),
	LAYOUT_32: getPixelSizeForLayoutSize(32),
	LAYOUT_36: getPixelSizeForLayoutSize(36),
	LAYOUT_40: getPixelSizeForLayoutSize(40),
	LAYOUT_42: getPixelSizeForLayoutSize(42),
	LAYOUT_50: getPixelSizeForLayoutSize(50),
	LAYOUT_60: getPixelSizeForLayoutSize(60),
	LAYOUT_62: getPixelSizeForLayoutSize(62),
	LAYOUT_70: getPixelSizeForLayoutSize(70),
	LAYOUT_75: getPixelSizeForLayoutSize(75),
	LAYOUT_80: getPixelSizeForLayoutSize(80),
	LAYOUT_90: getPixelSizeForLayoutSize(90),
	LAYOUT_100: getPixelSizeForLayoutSize(100),
	LAYOUT_110: getPixelSizeForLayoutSize(110),
	LAYOUT_120: getPixelSizeForLayoutSize(120),
	LAYOUT_140: getPixelSizeForLayoutSize(140),
	LAYOUT_160: getPixelSizeForLayoutSize(160),
	LAYOUT_200: getPixelSizeForLayoutSize(200),
}
