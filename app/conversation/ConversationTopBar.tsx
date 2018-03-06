import * as React from "react";
import { layoutSize } from "../constants/layoutSize";
import { HeaderIcon, Header, CenterPanel, Title, AppTitle } from "../ui/headers/Header";
import { SearchIcon } from "../ui/icons/SearchIcon";
import { navigate } from "../utils/navHelper";
import { tr } from "../i18n/t";
import { Icon } from "../ui/index";
import SearchBar from "../ui/SearchBar";
import { View } from "react-native";
import { PATH_CONVERSATION } from "../constants/paths";
import { Row } from "../ui/Grid";
import { connect } from "react-redux";

export class ConversationTopBar extends React.Component<{ navigation?: any, conversationsIsEmpty: boolean }, { searching: boolean }> {
	constructor(props){
		super(props);
		this.state = { searching: false };
	}

	private onClose() {
		const { navigation } = this.props;
		navigation.goBack();
	}

	search(){
		return <Header><SearchBar onClose={ () => this.setState({ searching: false })} path={PATH_CONVERSATION} /></Header>;
	}

	defaultView(){
		return (
			<Header>
				<HeaderIcon onPress={() => this.setState({ searching: true })}>
					{ !this.props.conversationsIsEmpty && <SearchIcon /> }
				</HeaderIcon>
				<AppTitle>{tr.Conversation}</AppTitle>
				<HeaderIcon onPress={() => this.onClose()}>
					<Icon size={ 22 } name={"new_message"} color={"transparent"} />
				</HeaderIcon>
			</Header>
		);
	}

	public render() {
		if(this.state.searching){
			return this.search();
		}
		
		return this.defaultView();
	}
}

export default connect(
	(state: any) => ({
		conversationsIsEmpty: state.threads.payload.length === 0
	})
)(ConversationTopBar) as any;