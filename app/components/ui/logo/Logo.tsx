import * as React from "react"

import { Animated, View } from "react-native"

import styles, {
	largeContainerSize,
	largeImageSize,
	marginTopLargeContainerSize,
	smallContainerSize,
	smallImageSize,
	marginTopSmallContainerSize
} from "./styles"

import { kResponsive} from "../KResponsive";

export interface LogoProperties {
    keyboardShow?: boolean
}

const _Logo = ({keyboardShow}: LogoProperties) => {
	const contImg = keyboardShow ? smallContainerSize :  largeContainerSize
    const img = keyboardShow ? smallImageSize : largeImageSize
    const heightMargin = keyboardShow ? marginTopSmallContainerSize : marginTopLargeContainerSize

	return (
		<View style={styles.container}>
			<Animated.View style={[styles.marginTopContainerImage, { height: heightMargin}]}/>
			<Animated.View style={[styles.containerImage, { width: contImg, height: contImg}]}>
				<Animated.Image resizeMode="contain"
								style={[styles.logo, { width: img, height: img}]}
								source={require("../../../../assets/icons/icon.png")} />
			</Animated.View>
		</View>
	)
}


export const Logo = kResponsive(_Logo);

