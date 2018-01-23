import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../../../constants/layoutSize"
import { Conf } from "../../../Conf"

const LargeImage = style.image({
	borderRadius: layoutSize.LAYOUT_24,
	width: layoutSize.LAYOUT_45,
	height: layoutSize.LAYOUT_45,
	margin: layoutSize.LAYOUT_2,
})

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
}

export const Avatar = ({ count, id, index, large }: AvatarProps) => {
	const pathSmall = `${Conf.platform}/workspace/document/${id}?thumbnail=20*20`
	const pathLarge = `${Conf.platform}/workspace/document/${id}?thumbnail=48*48`

	if (large) return <LargeImage source={{ uri: pathLarge }} />
	else return <SmallImage count={count} index={index} source={{ uri: pathSmall }} />
}
