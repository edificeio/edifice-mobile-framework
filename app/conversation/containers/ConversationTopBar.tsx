import * as React from "react";
import { Header, HeaderIcon, AppTitle } from "../../ui/headers/Header";
import { tr } from "../../i18n/t";
import { filterConversation } from '../actions/filter';
import { connect } from "react-redux";
import { SearchBar } from "../../ui/SearchBar";

export class ConversationTopBar extends React.Component<{ 
	navigation?: any, 
	conversationsIsEmpty: boolean, 
	filter: (searchText) => void 
}, { searching: boolean }> {

	constructor(props){
		super(props);
		this.state = { searching: false };
	}

	private onClose() {
		const { navigation } = this.props;
		navigation.goBack();
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.searchCleared){
			this.setState({ searching: false });
		}
	}

	search(){
		return <SearchBar onClose={ () => this.setState({ searching: false })} onChange={ (search) => this.props.filter(search) } />;
	}

	defaultView(){
		return (
			<Header>
				<HeaderIcon onPress={ () => this.setState({ searching: true }) } hidden={ this.props.conversationsIsEmpty } name={ "search" } />
				<AppTitle>{tr.Conversation}</AppTitle>
				<HeaderIcon name={ "new_message" } onPress={ () => this.props.navigation.navigate('newConversation') } />
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
		conversationsIsEmpty: state.conversation.threads.length === 0,
		searchCleared: !state.conversation.filterCleared
	}),
	(dispatch) => ({
		filter: (searchText) => filterConversation(dispatch)(searchText)
	})
)(ConversationTopBar) as any;