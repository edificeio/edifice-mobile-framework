import * as React from "react"
import { Animated } from "react-native"
import g from "glamorous-native"
import { size } from "../../../utils/Dim"
import { kResponsive } from "../KResponsive"

export interface LogoProperties {
	keyboardShow?: boolean
}

const Container = g.view({ alignItems: "center" })
const AnimationWrapper = g<any>(Animated.View)(
	{
		alignItems: "center",
		justifyContent: "center",
	},
	({ size }) => ({
		width: size,
		height: size,
	})
)

const AnimationImage = g<any>(Animated.Image)({}, ({ size }) => ({
	width: size,
	height: size,
}))

const _Logo = ({ keyboardShow }: LogoProperties) => {
	const s = keyboardShow ? size.small : size.large

	return (
		<Container>
			<AnimationWrapper size={s.margin} />
			<AnimationWrapper size={s.container}>
				<AnimationImage resizeMode="contain" size={s.image} source={require("../../../../assets/icons/icon.png")} />
			</AnimationWrapper>
		</Container>
	)
}

export const Logo = kResponsive(_Logo)
