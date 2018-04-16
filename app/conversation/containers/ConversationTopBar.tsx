import * as React from "react";
import { Header, HeaderIcon, AppTitle } from "../../ui/headers/Header";
import { filterConversation } from '../actions/filter';
import { connect } from "react-redux";
import { SearchBar } from "../../ui/SearchBar";
import { clearFilterConversation } from "../actions";
import { clearPickedUsers } from '../actions/pickUser';
import I18n from 'react-native-i18n';

export class ConversationTopBar extends React.Component<{ 
	navigation?: any, 
	conversationsIsEmpty: boolean, 
	filter: (searchText) => void,
	clearFilter: () => void,
	clearPickedUsers: () => void
}, { searching: boolean }> {

	constructor(props){
		super(props);
		this.state = { searching: false };
	}

	private onClose() {
		const { navigation } = this.props;
		navigation.goBack();
	}

	close(){
		this.setState({ searching: false });
		this.props.filter('');
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.searchCleared){
			this.setState({ searching: false });
		}
	}

	openSearch(){
		this.setState({ searching: true });
		this.props.filter('');
	}

	openNewConversation(){
		this.props.navigation.navigate('newConversation');
		this.props.clearPickedUsers();
	}

	search(){
		return <SearchBar onClose={ () => this.close() } onChange={ (search) => this.props.filter(search) } />;
	}

	defaultView(){
		return (
			<Header>
				<HeaderIcon onPress={ () => this.openSearch() } hidden={ this.props.conversationsIsEmpty } name={ "search" } />
				<AppTitle>{ I18n.t("Conversation") }</AppTitle>
				<HeaderIcon name={ "new_message" } iconSize={ 24 } onPress={ () => this.openNewConversation() } />
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
		filter: (searchText) => filterConversation(dispatch)(searchText),
		clearFilter: () => clearFilterConversation(dispatch)(),
		clearPickedUsers: () => clearPickedUsers(dispatch)()
	})
)(ConversationTopBar) as any;