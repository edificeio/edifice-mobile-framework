import * as React from "react";
import I18n from "react-native-i18n";
import { connect } from "react-redux";

import { IUser } from "../../user/reducers";

import { createConversation } from "../actions/createConversation";
import { loadVisibles } from "../actions/loadVisibles";
import { pickUser, unpickUser } from "../actions/pickUser";
import { openThread } from "../actions/thread";

import { PageContainer } from "../../ui/ContainerContent";
import { Back } from "../../ui/headers/Back";
import { Header, HeaderAction, Title } from "../../ui/headers/Header";
import SearchUser from "../../ui/SearchUser";

class NewThreadHeader extends React.Component<
  {
    navigation: any;
    createConversation: (pickedUsers: any) => any;
    pickedUsers: any[];
    openThread: (thread: string) => void;
  },
  undefined
> {
  public createConversation() {
    const newConversation = this.props.createConversation(
      this.props.pickedUsers
    );
    this.props.navigation.replace("thread", newConversation.id);
  }

  public render() {
    return (
      <Header>
        <Back navigation={this.props.navigation} />
        <Title>{I18n.t("conversation-newMessage")}</Title>
        <HeaderAction
          onPress={() =>
            this.props.pickedUsers.length > 0 && this.createConversation()
          }
          disabled={this.props.pickedUsers.length === 0}
        >
          {I18n.t("next")}
        </HeaderAction>
      </Header>
    );
  }
}

export const NewConversationHeader = connect(
  (state: any) => ({
    pickedUsers: state.conversation.pickedUsers
  }),
  dispatch => ({
    createConversation: pickedUsers =>
      createConversation(dispatch)(pickedUsers),
    openThread: (thread: string) => openThread(dispatch)(thread)
  })
)(NewThreadHeader);

interface NewConversationProps {
  remainingUsers: IUser[];
  loadVisibles: () => Promise<void>;
  pickedUsers: IUser[];
  pickUser: (user: IUser) => void;
  unpickUser: (user: IUser) => void;
}

class NewConversation extends React.Component<NewConversationProps, undefined> {
  componentDidMount() {
    this.props.loadVisibles();
  }

  render() {
    return (
      <PageContainer>
        <SearchUser
          remaining={this.props.remainingUsers}
          picked={this.props.pickedUsers}
          onPickUser={user => this.props.pickUser(user)}
          onUnpickUser={user => this.props.unpickUser(user)}
        />
      </PageContainer>
    );
  }
}

export default connect(
  (state: any) => {
    console.log(state);
    return {
      pickedUsers: state.conversation.pickedUsers,
      remainingUsers: state.conversation.remainingUsers
    };
  },
  dispatch => ({
    loadVisibles: () => loadVisibles(dispatch)(),
    pickUser: user => pickUser(dispatch)(user),
    unpickUser: user => unpickUser(dispatch)(user)
  })
)(NewConversation);
