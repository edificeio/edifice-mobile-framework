import style from "glamorous-native"
import * as React from "react";
import { Thread } from "../interfaces";
import { Me } from "../../infra/Me";
import { ListItem, LeftPanel, RightPanel, Content, CenterPanel } from "../../ui/ContainerContent";
import { GridAvatars } from "../../ui/avatars/GridAvatars";
import { DateView } from "../../ui/DateView";
import { CircleNumber } from "../../ui/CircleNumber";
import { CommonStyles } from "../../styles/common/styles";

interface IConversationProps extends Thread {
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
				{subject && subject.length ? <Content nb={nb} numberOfLines={ 1 }>{subject}</Content> : <style.View />}
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

	return <Author nb={nb} numberOfLines={ 1 }>{title}</Author>
}

const Author = style.text(
	{
		color: CommonStyles.textColor,
		fontSize: 14,
	},
	({ nb }) => ({
		fontFamily: nb > 0 ? CommonStyles.primaryFontFamilySemibold : CommonStyles.primaryFontFamily,
	})
)
