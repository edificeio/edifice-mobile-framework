import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../../../constants/layoutSize"
import { Conf } from "../../../Conf"
import { ImageProperties } from "react-native"

export enum Size {
	aligned,
	bigaligned,
	large,
	medium,
	small,
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

const AlignedLargeImage = style.image(
	{
		...StyledImage,
		borderRadius: layoutSize.LAYOUT_35,
		height: layoutSize.LAYOUT_70,
		marginLeft: layoutSize.LAYOUT_MOINS_20,
		width: layoutSize.LAYOUT_70,
	},
	({ index }) => ({
		zIndex: 100 - index,
	})
)

const SmallImage = style.image(
	{
		borderWidth: layoutSize.LAYOUT_1,
		borderColor: "white",
		position: "absolute",
	},
	({ count, index }) => ({
		borderRadius: count === 2 ? layoutSize.LAYOUT_15 : layoutSize.LAYOUT_10,
		top:
			count === 2
				? index === 0 ? layoutSize.LAYOUT_0 : layoutSize.LAYOUT_15
				: index < 2 ? layoutSize.LAYOUT_0 : layoutSize.LAYOUT_25,
		left:
			count === 2
				? index === 0 ? layoutSize.LAYOUT_0 : layoutSize.LAYOUT_15
				: index === 0 || (index === 2 && count === 4)
					? layoutSize.LAYOUT_0
					: index === 2 ? layoutSize.LAYOUT_14 : layoutSize.LAYOUT_25,
		width: count === 2 ? layoutSize.LAYOUT_31 : layoutSize.LAYOUT_22,
		height: count === 2 ? layoutSize.LAYOUT_31 : layoutSize.LAYOUT_22,
	})
)

export interface AvatarProps {
	count?: number
	id: string
	index?: number
	large?: boolean
	size: Size
}

export const Avatar = ({ size, count = 1, id, index = 1 }: AvatarProps) => {
	const pathSmall = `${Conf.platform}/userbook/avatar/${id}?thumbnail=20*20`
	const pathMedium = `${Conf.platform}/userbook/avatar/${id}?thumbnail=35*35`
	const pathLarge = `${Conf.platform}/userbook/avatar/${id}?thumbnail=48*48`

	if (size === Size.large) return <LargeImage source={{ uri: pathLarge }} />
	else if (size === Size.medium) return <MediumImage source={{ uri: pathMedium }} />
	else if (size === Size.aligned) return <AlignedImage index={index} source={{ uri: pathMedium }} />
	else if (size === Size.bigaligned) return <AlignedLargeImage index={index} source={{ uri: pathLarge }} />
	else return <SmallImage count={count} index={index} source={{ uri: pathSmall }} />
}
