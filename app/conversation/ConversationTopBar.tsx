import * as React from "react"
import { layoutSize } from "../constants/layoutSize"
import { TouchableBarPanel, ContainerTopBar, CenterPanel, CenterTextPanel } from "../ui/ContainerBar"
import { SearchIcon } from "../ui/icons/SearchIcon"
import { navigate } from "../utils/navHelper"
import { tr } from "../i18n/t"
import { Icon } from "../ui/index"
import SearchBar from "../ui/SearchBar";
import { View } from "react-native";
import { PATH_CONVERSATION } from "../constants/paths";
import { Row } from "../ui/Row";

export interface ConversationTopBarProps {
	navigation?: any
}

export class ConversationTopBar extends React.Component<ConversationTopBarProps, { searching: boolean }> {
	constructor(props){
		super(props);
		this.state = { searching: false };
	}

	private onClose() {
		const { navigation } = this.props

		navigation.goBack()
	}

	public render() {
		console.log(this.props.navigation)
		return (
			<ContainerTopBar>
				{ this.state.searching && <SearchBar onClose={ () => this.setState({ searching: false })} path={PATH_CONVERSATION} /> }
				{ !this.state.searching && (<Row>
					<TouchableBarPanel onPress={() => this.setState({ searching: true })}>
						<SearchIcon />
					</TouchableBarPanel>
					<CenterPanel>
						<CenterTextPanel>{tr.Conversation}</CenterTextPanel>
					</CenterPanel>
					<TouchableBarPanel onPress={() => this.onClose()}>
						<Icon size={layoutSize.LAYOUT_22} name={"new_message"} color={"white"} />
					</TouchableBarPanel>
				</Row>) }
			</ContainerTopBar>
		)
	}
}
