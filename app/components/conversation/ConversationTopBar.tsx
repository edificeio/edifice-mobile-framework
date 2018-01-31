import * as React from "react"
import { layoutSize } from "../../constants/layoutSize"
import { TouchableBarPanel, ContainerTopBar, CenterPanel, Text } from "../ui/ContainerBar"
import { SearchIcon } from "../ui/icons/SearchIcon"
import { navigate } from "../../utils/navHelper"
import { tr } from "../../i18n/t"
import { Icon } from ".."

export interface ConversationTopBarProps {
	navigation?: any
}

export class ConversationTopBar extends React.PureComponent<ConversationTopBarProps, {}> {
	private onClose() {
		const { navigation } = this.props

		navigation.goBack()
	}

	public render() {
		return (
			<ContainerTopBar>
				<TouchableBarPanel onPress={() => navigate("ConversationSearch")}>
					<SearchIcon />
				</TouchableBarPanel>
				<CenterPanel>
					<Text>{tr.Conversation}</Text>
				</CenterPanel>
				<TouchableBarPanel onPress={() => this.onClose()}>
					<Icon size={layoutSize.LAYOUT_22} name={"new_message"} color={"white"} />
				</TouchableBarPanel>
			</ContainerTopBar>
		)
	}
}
