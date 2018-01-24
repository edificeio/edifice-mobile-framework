import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../../constants/layoutSize"
import { IThreadModel } from "../../model/Thread"
import { clean, trunc } from "../../utils/html"
import { CommonStyles } from "../styles/common/styles"
import { Avatar } from "../ui/Avatars/Avatar"

const Item = style.view(
	{
		borderBottomColor: CommonStyles.borderBottomItem,
		borderBottomWidth: 1,
		flexDirection: "row",
		paddingHorizontal: layoutSize.LAYOUT_16,
		paddingVertical: layoutSize.LAYOUT_12,
	},
	({ my }) => ({
		backgroundColor: my ? CommonStyles.nonLue : CommonStyles.itemBackgroundColor,
	})
)

const LeftPanel = style.view({
	width: layoutSize.LAYOUT_50,
	height: layoutSize.LAYOUT_50,
})

const CenterPanel = style.view(
	{
		flex: 1,
		padding: layoutSize.LAYOUT_2,
	},
	({ my }) => ({
		marginLeft: my ? layoutSize.LAYOUT_120 : 0,
		marginRight: my ? 0 : layoutSize.LAYOUT_120,
	})
)

const Content = style.text(
	{
		color: CommonStyles.iconColorOff,
		fontFamily: CommonStyles.primaryFontFamily,
		fontSize: layoutSize.LAYOUT_14,
		marginTop: layoutSize.LAYOUT_10,
	},
	({ my }) => ({
		color: my ? "white" : CommonStyles.textColor,
		backgroundColor: my ? CommonStyles.iconColorOn : "white",
	})
)

interface ThreadProps extends IThreadModel {
	userId: string
}

export const Thread = ({ body, date, displayNames = [], from = "", userId }: ThreadProps) => {
	const my = from === userId

	if (!body) return <style.View />

	return (
		<Item my={my}>
			{displayNames.length > 2 &&
				from.length > 0 && (
					<LeftPanel>
						<Avatar id={from} />
					</LeftPanel>
				)}
			<CenterPanel my={my}>
				<Content my={my}>{clean(body, 300)}</Content>
			</CenterPanel>
		</Item>
	)
}
