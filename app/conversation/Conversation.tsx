import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../constants/layoutSize"
import { IThreadModel } from "../model/Thread"
import { adaptator } from "../infra/HTMLAdaptator"
import { CommonStyles } from "../styles/common/styles"
import { Size } from "../ui/Avatar"
import { Avatars } from "../ui/Avatars"
import { DateView } from "../ui/DateView"
import { CircleNumber } from "../ui/CircleNumber"
import { CenterPanel, Content, Item, LeftPanel, RightPanel } from "../ui/ContainerContent"
import {Row} from "../ui";
import {trunc} from "../utils/html";

interface IConversationProps extends IThreadModel {
	onPress: (id: string, displayNames: string[][], subject: string) => void
}

export const Conversation = ({ id, subject, date, displayNames, nb, onPress }: IConversationProps) => {
	const images = displayNames.reduce((acc, elem) => [...acc, elem[0]], [])

	return (
		<Item nb={nb} onPress={() => onPress(id, displayNames, subject)}>
			<Row>
				<LeftPanel>
					<Avatars images={images} size={Size.small} />
				</LeftPanel>
				<CenterPanel>
					{getTitle(displayNames, nb)}
					{subject.length ? <Content nb={nb}>{adaptator(subject).toOneLineText()}</Content> : <style.View />}
				</CenterPanel>
				<RightPanel>
					<DateView date={date} nb={nb} />
					<CircleNumber nb={nb} />
				</RightPanel>
			</Row>
		</Item>
	)
}

function getTitle(displayNames, nb) {
	const title = displayNames.reduce((acc, elem) => (acc.length === 0 ? elem[1] : `${acc}, ${elem[1]}`), "")

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
