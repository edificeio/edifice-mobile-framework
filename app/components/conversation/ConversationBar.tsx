import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../../constants/layoutSize"
import { CommonStyles } from "../styles/common/styles"
import { CenterPanel, ContainerBar, LeftPanel, RightPanel } from "../ui/ContainerBar"
import { SearchIcon } from "../ui/icons/SearchIcon"
import { navigate } from "../../utils/navHelper"
import { tr } from "../../i18n/t"
import { Icon } from ".."

const Text = style.text({
	color: "white",
	fontFamily: CommonStyles.primaryFontFamily,
	fontWeight: "400",
	fontSize: layoutSize.LAYOUT_18,
	paddingTop: layoutSize.LAYOUT_12,
})

export interface ConversationBarProps {
	navigation?: any
}

export class ConversationBar extends React.PureComponent<ConversationBarProps, {}> {
	private onClose() {
		const { navigation } = this.props

		navigation.goBack()
	}

	public render() {
		return (
			<ContainerBar>
				<LeftPanel onPress={() => navigate("ConversationSearch")}>
					<SearchIcon />
				</LeftPanel>
				<CenterPanel>
					<Text>{tr.Conversation}</Text>
				</CenterPanel>
				<RightPanel onPress={() => this.onClose()}>
					<Icon size={layoutSize.LAYOUT_24} name={"new_message"} color={"white"} />
				</RightPanel>
			</ContainerBar>
		)
	}
}
