import * as React from "react";
import { layoutSize } from "../constants/layoutSize";
import { HeaderIcon, Header, CenterPanel, Title } from "../ui/headers/Header";
import { SearchIcon } from "../ui/icons/SearchIcon";
import { navigate } from "../utils/navHelper";
import { tr } from "../i18n/t";
import { Icon } from "../ui/index";
import SearchBar from "../ui/SearchBar";
import { View } from "react-native";
import { PATH_CONVERSATION } from "../constants/paths";
import { Row } from "../ui/Grid";

export interface ConversationTopBarProps {
	navigation?: any
}

export class ConversationTopBar extends React.Component<ConversationTopBarProps, { searching: boolean }> {
	constructor(props){
		super(props);
		this.state = { searching: false };
	}

	private onClose() {
		const { navigation } = this.props;
		navigation.goBack();
	}

	public render() {
		return (
			<Header>
				{ this.state.searching && <SearchBar onClose={ () => this.setState({ searching: false })} path={PATH_CONVERSATION} /> }
				{ !this.state.searching && (<Row>
					<HeaderIcon onPress={() => this.setState({ searching: true })}>
						<SearchIcon />
					</HeaderIcon>
					<CenterPanel>
						<Title>{tr.Conversation}</Title>
					</CenterPanel>
					<HeaderIcon onPress={() => this.onClose()}>
						<Icon size={ 22 } name={"new_message"} color={"transparent"} />
					</HeaderIcon>
				</Row>) }
			</Header>
		)
	}
}
