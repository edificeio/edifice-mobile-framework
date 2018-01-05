import { PixelRatio, Platform, Dimensions } from "react-native"

const DEVICE_SCALE = Dimensions.get("window").width / 375;

const DEFAULT_FONT = "OpenSans";

/* utils ==================================================================== */

// get font name and weight
function fontWithWeight(family = DEFAULT_FONT) : string {
    return family;
}

function normalize(size: number): number {
    return Math.round(DEVICE_SCALE * size);
}

// attempt to normalize x-platform line heights
function lineHeight(val = 1, scale = 1, normalized = true) {
    let adjusted = normalized ? normalize(val) : val;
    return Math.round(Platform.OS === "android" ? adjusted * scale : adjusted);
}

/* export =================================================================== */

export const layoutSize = {
	LAYOUT_MOINS_2: normalize(-2),
	LAYOUT_0: normalize(0),
	LAYOUT_1: normalize(1),
	LAYOUT_2: normalize(2),
	LAYOUT_3: normalize(3),
	LAYOUT_4: normalize(4),
	LAYOUT_5: normalize(5),
	LAYOUT_6: normalize(6),
	LAYOUT_7: normalize(7),
	LAYOUT_8: normalize(8),
	LAYOUT_9: normalize(9),
	LAYOUT_10: normalize(10),
	LAYOUT_11: normalize(11),
	LAYOUT_12: normalize(12),
	LAYOUT_13: normalize(13),
	LAYOUT_14: normalize(14),
	LAYOUT_15: normalize(15),
	LAYOUT_16: normalize(16),
	LAYOUT_18: normalize(18),
	LAYOUT_20: normalize(20),
	LAYOUT_22: normalize(22),
	LAYOUT_23: normalize(23),
	LAYOUT_24: normalize(24),
	LAYOUT_25: normalize(25),
    LAYOUT_26: normalize(26),
	LAYOUT_28: normalize(28),
	LAYOUT_30: normalize(30),
	LAYOUT_31: normalize(31),
	LAYOUT_32: normalize(32),
    LAYOUT_34: normalize(34),
	LAYOUT_36: normalize(36),
    LAYOUT_38: normalize(38),
	LAYOUT_40: normalize(40),
	LAYOUT_42: normalize(42),
    LAYOUT_46: normalize(46),
	LAYOUT_50: normalize(50),
	LAYOUT_60: normalize(60),
	LAYOUT_62: normalize(62),
	LAYOUT_70: normalize(70),
	LAYOUT_75: normalize(75),
	LAYOUT_80: normalize(80),
	LAYOUT_90: normalize(90),
	LAYOUT_100: normalize(100),
	LAYOUT_110: normalize(110),
	LAYOUT_120: normalize(120),
	LAYOUT_140: normalize(140),
	LAYOUT_160: normalize(160),
	LAYOUT_200: normalize(200),
}
