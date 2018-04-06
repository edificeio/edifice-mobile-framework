import style from "glamorous-native"
import * as React from "react";
import { Thread } from "../interfaces";
import { Me } from "../../infra/Me";
import { ListItem, LeftPanel, RightPanel, Content, CenterPanel } from "../../ui/ContainerContent";
import { GridAvatars } from "../../ui/avatars/GridAvatars";
import { DateView } from "../../ui/DateView";
import { CircleNumber } from "../../ui/CircleNumber";
import { CommonStyles } from "../../styles/common/styles";
import { findReceivers } from "../actions";

interface IConversationProps extends Thread {
	onPress: (id: string, displayNames: string[][], subject: string) => void
}

export const Conversation = ({ id, subject, date, displayNames, nb, onPress, to, from, cc }: IConversationProps) => {
	return (
		<ListItem nb={nb} onPress={() => onPress(id, displayNames, subject)}>
			<LeftPanel>
				<GridAvatars users={findReceivers(to, from, cc)} />
			</LeftPanel>
			<CenterPanel>
				<Author nb={nb} numberOfLines={ 1 }>{ 
					findReceivers(to, from, cc).map(r => displayNames.find(dn => dn[0] === r)[1]).join(', ') 
				}</Author>
				{subject && subject.length ? <Content nb={nb} numberOfLines={ 1 }>{subject}</Content> : <style.View />}
			</CenterPanel>
			<RightPanel>
				<DateView date={ date } strong={ nb > 0 } />
				<CircleNumber nb={nb} />
			</RightPanel>
		</ListItem>
	)
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
