import style from "glamorous-native"
import * as React from "react"
import { Animated } from "react-native"
import { size } from "../../utils/Dim"
import { KeyboardInjection } from "../KeyboardInjection"

export interface ILogoProperties {
	keyboardShow?: boolean
}

const Container = style.view({ alignItems: "center" })
const AnimationWrapper = style<any>(Animated.View)(
	{
		alignItems: "center",
		justifyContent: "center",
	},
	({ size }) => ({
		height: size,
		width: size,
	})
)

const AnimationImage = style<any>(Animated.Image)({}, ({ size }) => ({
	height: size,
	width: size,
}))

const logo = ({ keyboardShow }: ILogoProperties) => {
	const s = keyboardShow ? size.small : size.large

	return (
		<Container>
			<AnimationWrapper size={s.margin} />
			<AnimationWrapper size={s.container}>
				<AnimationImage resizeMode="contain" size={s.image} source={require("../../../assets/icons/icon.png")} />
			</AnimationWrapper>
		</Container>
	)
}

export const Logo = KeyboardInjection(logo)
