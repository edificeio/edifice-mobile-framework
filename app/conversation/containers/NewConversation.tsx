import style from "glamorous-native";
import * as React from "react";
import { connect } from "react-redux";
import { Header, Title, HeaderAction } from "../../ui/headers/Header";
import { Back } from "../../ui/headers/Back";
import { User } from "../../model/Auth";
import { PageContainer } from "../../ui/ContainerContent";
import SearchUser from "../../ui/SearchUser";
import { loadVisibles } from "../actions/loadVisibles";
import I18n from 'react-native-i18n';

class NewThreadHeader extends React.Component<{ navigation: any }, undefined> {
    createConversation(){

    }

    render(){
        return <Header>
        <Back navigation={ this.props.navigation } />
        <Title>{ I18n.t('conversation-newMessage') }</Title>
        <HeaderAction onPress={ () => this.createConversation() }>{ I18n.t('next') }</HeaderAction>
    </Header>
    }
}

export const NewConversationHeader = connect(
	(state: any) => ({
	}), 
	dispatch => ({
	})
)(NewThreadHeader)

class NewConversation extends React.Component<{ visibles: User[], loadVisibles: () => Promise<void> }, undefined> {
    
    componentDidMount(){
        this.props.loadVisibles();
    }

    render(){
        return <PageContainer>
            <SearchUser visibles={ this.props.visibles } picked={ [] } onPickUser={ () => null }></SearchUser>
        </PageContainer>
    }
}

export default connect(
	(state: any) => { console.log(state); return ({
        visibles: state.conversation.visibles
	}) }, 
	dispatch => ({
        loadVisibles: () => loadVisibles(dispatch)()
	})
)(NewConversation)