import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../../constants/layoutSize"
import { IThreadModel } from "../../model/Thread"
import { trunc } from "../../utils/html"
import { CommonStyles } from "../styles/common/styles"
import { Avatars } from "../ui/Avatars/Avatars"
import { DateView } from "../ui/DateView"
import { NonLu } from "../ui/NonLu"

const Item = style.touchableOpacity(
	{
		backgroundColor: CommonStyles.itemBackgroundColor,
		borderBottomColor: CommonStyles.borderBottomItem,
		borderBottomWidth: 1,
		flexDirection: "row",
		paddingHorizontal: layoutSize.LAYOUT_16,
		paddingVertical: layoutSize.LAYOUT_12,
	},
	({ nb }) => ({
		backgroundColor: nb > 0 ? CommonStyles.nonLue : CommonStyles.itemBackgroundColor,
	})
)

const LeftPanel = style.view({
	width: layoutSize.LAYOUT_50,
	height: layoutSize.LAYOUT_50,
})

const CenterPanel = style.view({
	alignItems: "flex-start",
	flex: 1,
	justifyContent: "center",
	padding: layoutSize.LAYOUT_2,
	marginHorizontal: layoutSize.LAYOUT_6,
})

const RightPanel = style.view({
	alignItems: "center",
	height: layoutSize.LAYOUT_50,
	justifyContent: "flex-end",
	width: layoutSize.LAYOUT_50,
})

const Author = style.text(
	{
		color: CommonStyles.textColor,
		fontSize: layoutSize.LAYOUT_14,
	},
	({ nb }) => ({
		fontFamily: nb > 0 ? CommonStyles.primaryFontFamilySemibold : CommonStyles.primaryFontFamily,
	})
)

const Content = style.text(
	{
		color: CommonStyles.iconColorOff,
		fontFamily: CommonStyles.primaryFontFamilyLight,
		fontSize: layoutSize.LAYOUT_12,
		marginTop: layoutSize.LAYOUT_10,
	},
	({ nb }) => ({
		color: nb > 0 ? CommonStyles.textColor : CommonStyles.iconColorOff,
		fontFamily: nb > 0 ? CommonStyles.primaryFontFamily : CommonStyles.primaryFontFamilyLight,
	})
)

function getTitle(displayNames, nb) {
	const title = displayNames.reduce((acc, elem) => (acc.length === 0 ? elem[1] : `${acc}, ${elem[1]}`), "")

	return <Author nb={nb}>{trunc(title, layoutSize.LAYOUT_26)}</Author>
}

function getContent(nb, subject) {
	if (subject.length === 0) return <style.View />

	return <Content nb={nb}>{trunc(subject, layoutSize.LAYOUT_32)}</Content>
}

interface ConversationProps extends IThreadModel {
	onPress: (id: string) => void
}

export const Conversation = ({ id, subject, date, displayNames, nb, onPress }: ConversationProps) => {
	return (
		<Item nb={nb} onPress={() => onPress(id)}>
			<LeftPanel>
				<Avatars displayNames={displayNames} />
			</LeftPanel>
			<CenterPanel>
				{getTitle(displayNames, nb)}
				{getContent(nb, subject)}
			</CenterPanel>
			<RightPanel>
				<DateView date={date} nb={nb} />
				<NonLu nb={nb} />
			</RightPanel>
		</Item>
	)
}
