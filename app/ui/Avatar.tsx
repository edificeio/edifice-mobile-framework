import style from "glamorous-native"
import * as React from "react"
import { Conf } from "../Conf"
import { layoutSize } from "../constants/layoutSize"

export enum Size {
	aligned,
	large,
	medium,
	small,
	verylarge,
}
const StyledImage = {
	borderColor: "white",
	borderWidth: layoutSize.LAYOUT_1,
	margin: layoutSize.LAYOUT_2,
}

const LargeImage = style.image({
	...StyledImage,
	borderRadius: layoutSize.LAYOUT_24,
	height: layoutSize.LAYOUT_45,
	width: layoutSize.LAYOUT_45,
})

const MediumImage = style.image({
	...StyledImage,
	borderRadius: layoutSize.LAYOUT_16,
	height: layoutSize.LAYOUT_35,
	width: layoutSize.LAYOUT_35,
})

const AlignedImage = style.image(
	{
		...StyledImage,
		borderRadius: layoutSize.LAYOUT_16,
		height: layoutSize.LAYOUT_29,
		marginLeft: layoutSize.LAYOUT_MOINS_12,
		width: layoutSize.LAYOUT_29,
	},
	({ index }) => ({
		zIndex: 100 - index,
	})
)

const VeryLargeImage = style.image(
	{
		...StyledImage,
		alignSelf: "center",
		borderRadius: layoutSize.LAYOUT_35,
		height: layoutSize.LAYOUT_71,
		width: layoutSize.LAYOUT_71,
		margin: 0,
	},
	({ decorate }) => ({
		borderWidth: decorate ? layoutSize.LAYOUT_1 : layoutSize.LAYOUT_0,
	})
)

const SmallImage = style.image(
	{
		borderColor: "white",
		borderWidth: layoutSize.LAYOUT_1,
		position: "absolute",
	},
	({ count, index }) => ({
		borderRadius: count === 1 ? layoutSize.LAYOUT_22 : count === 2 ? layoutSize.LAYOUT_15 : layoutSize.LAYOUT_10,
		height: count === 1 ? layoutSize.LAYOUT_45 : count === 2 ? layoutSize.LAYOUT_31 : layoutSize.LAYOUT_22,
		left:
			count === 2
				? index === 0 ? layoutSize.LAYOUT_0 : layoutSize.LAYOUT_15
				: index === 0 || (index === 2 && count === 4)
					? layoutSize.LAYOUT_0
					: index === 2 ? layoutSize.LAYOUT_14 : layoutSize.LAYOUT_25,
		top:
			count === 2
				? index === 0 ? layoutSize.LAYOUT_0 : layoutSize.LAYOUT_15
				: index < 2 ? layoutSize.LAYOUT_0 : layoutSize.LAYOUT_25,
		width: count === 1 ? layoutSize.LAYOUT_45 : count === 2 ? layoutSize.LAYOUT_31 : layoutSize.LAYOUT_22,
	})
)

export interface IAvatarProps {
	count?: number
	decorate?: boolean
	id: string
	index?: number
	large?: boolean
	size: Size
}

export const Avatar = ({ decorate = true, size, count = 1, id, index = 0 }: IAvatarProps) => {
	const pathSmall = `${Conf.platform}/userbook/avatar/${id}?thumbnail=20*20`
	const pathMedium = `${Conf.platform}/userbook/avatar/${id}?thumbnail=35*35`
	const pathLarge = `${Conf.platform}/userbook/avatar/${id}?thumbnail=48*48`

	if (size === Size.large) {
		return <LargeImage source={{ uri: pathLarge }} />
	} else if (size === Size.medium) {
		return <MediumImage source={{ uri: pathMedium }} />
	} else if (size === Size.aligned) {
		return <AlignedImage index={index} source={{ uri: pathMedium }} />
	} else if (size === Size.verylarge) {
		return <VeryLargeImage decorate={decorate} source={{ uri: pathLarge }} />
	} else {
		return <SmallImage count={count} index={index} source={{ uri: pathSmall }} />
	}
}
