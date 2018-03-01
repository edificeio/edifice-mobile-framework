import style from "glamorous-native"
import * as React from "react";
import { layoutSize } from "../constants/layoutSize"
import { IThreadModel } from "../model/Thread"
import { CommonStyles } from "../styles/common/styles"
import { DateView } from "../ui/DateView"
import { CircleNumber } from "../ui/CircleNumber"
import { CenterPanel, Content, ListItem, LeftPanel, RightPanel } from "../ui/ContainerContent"
import { Row, ButtonsOkCancel } from "../ui"
import { trunc } from "../utils/html"
import { GridAvatars } from "../ui/avatars/GridAvatars";
import { Me } from "../infra/Me";

interface IConversationProps extends IThreadModel {
	onPress: (id: string, displayNames: string[][], subject: string) => void
}

export const Conversation = ({ id, subject, date, displayNames, nb, onPress }: IConversationProps) => {
	const images = displayNames.reduce(
		(acc, elem) => (elem[0] === Me.session.userId && displayNames.length !== 1 ? acc : [...acc, elem[0]]),
		[]
	)

	return (
		<ListItem nb={nb} onPress={() => onPress(id, displayNames, subject)}>
			<LeftPanel>
				<GridAvatars users={images} />
			</LeftPanel>
			<CenterPanel>
				{getTitle(displayNames, nb)}
				{subject && subject.length ? <Content nb={nb}>{trunc(subject, layoutSize.LAYOUT_32)}</Content> : <style.View />}
			</CenterPanel>
			<RightPanel>
				<DateView date={ date } nb={nb} />
				<CircleNumber nb={nb} />
			</RightPanel>
		</ListItem>
	)
}

function getTitle(displayNames, nb) {
	const title = displayNames.reduce(
		(acc, elem) =>
			elem[0] === Me.session.userId && displayNames.length !== 1 ? acc : acc.length === 0 ? elem[1] : `${acc}, ${elem[1]}`,
		""
	)

	return <Author nb={nb}>{trunc(title, layoutSize.LAYOUT_26)}</Author>
}

const Author = style.text(
	{
		color: CommonStyles.textColor,
		fontSize: layoutSize.LAYOUT_14,
	},
	({ nb }) => ({
		fontFamily: nb > 0 ? CommonStyles.primaryFontFamilySemibold : CommonStyles.primaryFontFamily,
	})
)
