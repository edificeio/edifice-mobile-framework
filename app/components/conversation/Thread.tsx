import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../../constants/layoutSize"
import { IThreadModel } from "../../model/Thread"
import { clean, trunc } from "../../utils/html"
import { CommonStyles } from "../styles/common/styles"
import { Avatar, Size } from "../ui/Avatars/Avatar"
import { ViewStyle } from "react-native"
import { DateView } from "../ui/DateView"

const Item = style.view({
	backgroundColor: CommonStyles.backgroundColor,
	flexDirection: "row",
	paddingHorizontal: layoutSize.LAYOUT_16,
	paddingVertical: layoutSize.LAYOUT_12,
	alignItems: "center",
	justifyContent: "center",
})

const LeftPanel = style.view({
	alignItems: "center",
	height: layoutSize.LAYOUT_45,
	justifyContent: "center",
	width: layoutSize.LAYOUT_45,
	marginRight: layoutSize.LAYOUT_12,
	paddingBottom: layoutSize.LAYOUT_20,
})

const CenterPanel = style.view(
	{
		flex: 1,
	},
	({ my }): ViewStyle => ({
		alignItems: my ? "flex-end" : "flex-start",
		marginLeft: my ? layoutSize.LAYOUT_54 : 0,
		marginRight: my ? 0 : layoutSize.LAYOUT_54,
	})
)

const ContainerContent = style.view(
	{
		borderBottomLeftRadius: layoutSize.LAYOUT_15,
		borderTopLeftRadius: layoutSize.LAYOUT_15,
		borderTopRightRadius: layoutSize.LAYOUT_15,
		elevation: layoutSize.LAYOUT_4,
		flex: 1,
		justifyContent: "center",
		padding: layoutSize.LAYOUT_20,
		marginBottom: layoutSize.LAYOUT_10,
	},
	({ my }): ViewStyle => ({
		backgroundColor: my ? CommonStyles.iconColorOn : "white",
		borderBottomRightRadius: my ? 0 : layoutSize.LAYOUT_15,
		shadowColor: my ? "#ffffff" : CommonStyles.shadowColor,
		shadowOpacity: my ? 0 : CommonStyles.shadowOpacity,
		shadowRadius: my ? 0 : CommonStyles.shadowRadius,
	})
)

const Content = style.text(
	{
		color: CommonStyles.iconColorOff,
		fontFamily: CommonStyles.primaryFontFamily,
		fontSize: layoutSize.LAYOUT_14,
	},
	({ my }) => ({
		color: my ? "white" : CommonStyles.textColor,
	})
)

interface ThreadProps extends IThreadModel {
	userId: string
}

export const Thread = ({ body, date, displayNames = [], from = "", userId }: ThreadProps) => {
	const my = from === userId

	if (!body) return <style.View />

	return (
		<Item>
			{displayNames.length > 2 &&
				!my && (
					<LeftPanel>
						<Avatar id={from} size={Size.large} />
					</LeftPanel>
				)}
			<CenterPanel my={my}>
				<ContainerContent my={my}>
					<Content my={my}>{clean(body, 300)}</Content>
				</ContainerContent>
				<DateView date={date} />
			</CenterPanel>
		</Item>
	)
}
