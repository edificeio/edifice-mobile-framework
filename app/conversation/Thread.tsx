import style from "glamorous-native"
import * as React from "react"
import { ViewStyle } from "react-native"
import { adaptator } from "../infra/HTMLAdaptator"
import { layoutSize } from "../constants/layoutSize"
import { IThreadModel } from "../model/Thread"
import { CommonStyles } from "../styles/common/styles"
import { Size } from "../ui/Avatar"
import { Avatar } from "../ui/Avatar"
import { DateView } from "../ui/DateView"
import { Content } from "../ui/ContainerContent"

interface IThreadProps extends IThreadModel {
	userId: string
}

export const Thread = ({ body, date, displayNames = [], from = "", userId }: IThreadProps) => {
	const my = from === userId

	if (!body) {
		return <style.View />
	}

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
					<Content>{adaptator(body).toText()}</Content>
				</ContainerContent>
				<DateView date={date} />
			</CenterPanel>
		</Item>
	)
}

const Item = style.view({
	alignItems: "center",
	backgroundColor: CommonStyles.backgroundColor,
	flexDirection: "row",
	justifyContent: "center",
	paddingHorizontal: layoutSize.LAYOUT_16,
	paddingVertical: layoutSize.LAYOUT_12,
})

const LeftPanel = style.view({
	height: layoutSize.LAYOUT_50,
	width: layoutSize.LAYOUT_50,
})

const CenterPanel = style.view(
	{
		flex: 1,
	},
	({ my }): ViewStyle => ({
		alignItems: my ? "flex-end" : "flex-start",
		marginLeft: my ? layoutSize.LAYOUT_54 : 5,
		marginRight: my ? 0 : layoutSize.LAYOUT_54,
	})
)

const ContainerContent = style.view(
	{
		borderBottomLeftRadius: layoutSize.LAYOUT_15,
		borderTopLeftRadius: layoutSize.LAYOUT_15,
		borderTopRightRadius: layoutSize.LAYOUT_15,
		justifyContent: "center",
		marginBottom: layoutSize.LAYOUT_10,
		padding: layoutSize.LAYOUT_20,
		shadowColor: CommonStyles.shadowColor,
		shadowOpacity: CommonStyles.shadowOpacity,
		shadowOffset: CommonStyles.shadowOffset,
		shadowRadius: CommonStyles.shadowRadius,
	},
	({ my }): ViewStyle => ({
		backgroundColor: my ? CommonStyles.iconColorOn : "white",
		borderBottomRightRadius: my ? 0 : layoutSize.LAYOUT_15,
		elevation: my ? layoutSize.LAYOUT_0 : layoutSize.LAYOUT_3,
	})
)
