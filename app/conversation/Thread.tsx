import style from "glamorous-native"
import * as React from "react"
import { ViewStyle, Text } from "react-native";
import { CommonStyles } from "../styles/common/styles"
import { DateView } from "../ui/DateView"
import { tr } from "../i18n/t"
import { SingleAvatar } from "../ui/avatars/SingleAvatar";
import { Me } from "../infra/Me";
import { Message, ThreadStatus } from "../model/conversation";
import { adaptator } from "../infra/HTMLAdaptator";

export const Thread = ({ body, date, displayNames = [], from = "", status }: Message) => {
	const my = from === Me.session.userId

	if (!body) {
		return <style.View />
	}

	return (
		<Item>
			{displayNames.length > 2 &&
				!my && (
					<LeftPanel>
						<SingleAvatar userId={from} />
					</LeftPanel>
				)}
			<CenterPanel my={my}>
				<ContainerContent my={my}>
					<Content my={my}>{adaptator(body).toText()}</Content>
				</ContainerContent>
				{status !== ThreadStatus.sending && <DateView date={date} />}
				{status === ThreadStatus.sending && <Text>{tr.Sending_msg}</Text>}
			</CenterPanel>
		</Item>
	)
}

const Item = style.view({
	alignItems: "center",
	backgroundColor: CommonStyles.lightGrey,
	flexDirection: "row",
	justifyContent: "center",
	paddingHorizontal: 16,
	paddingVertical: 12,
})

const LeftPanel = style.view({
	height: 50,
	width: 50,
})

const CenterPanel = style.view(
	{
		flex: 1,
	},
	({ my }): ViewStyle => ({
		alignItems: my ? "flex-end" : "flex-start",
		marginLeft: my ? 54 : 5,
		marginRight: my ? 0 : 54,
	})
)

const ContainerContent = style.view(
	{
		borderBottomLeftRadius: 15,
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		justifyContent: "center",
		marginBottom: 10,
		padding: 20,
		shadowColor: CommonStyles.shadowColor,
		shadowOpacity: CommonStyles.shadowOpacity,
		shadowOffset: CommonStyles.shadowOffset,
		shadowRadius: CommonStyles.shadowRadius,
	},
	({ my }): ViewStyle => ({
		backgroundColor: my ? CommonStyles.iconColorOn : "white",
		borderBottomRightRadius: my ? 0 : 15,
		elevation: my ? 0 : 3,
	})
)

const Content = style.text(
	{
		color: CommonStyles.iconColorOff,
		fontFamily: CommonStyles.primaryFontFamily,
		fontSize: 14,
	},
	({ my }) => ({
		color: my ? "white" : CommonStyles.textColor,
	})
)
