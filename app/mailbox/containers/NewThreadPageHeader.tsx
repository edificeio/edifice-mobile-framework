import * as React from "react";
import I18n from "react-native-i18n";
import { connect } from "react-redux";

import { Back } from "../../ui/headers/Back";
import { Header, HeaderAction, Title } from "../../ui/headers/Header";
import { createThread } from "../actions/createThread";

import mailboxConfig from "../config";

export class NewThreadPageHeader extends React.Component<
  {
    navigation: any;
    createThread: (pickedUsers: any) => any;
    pickedUsers: any[];
  },
  undefined
> {
  public handleCreateThread() {
    const newConversation = this.props.createThread(this.props.pickedUsers);
    this.props.navigation.replace("thread", newConversation.id);
  }

  public render() {
    return (
      <Header>
        <Back navigation={this.props.navigation} />
        <Title>{I18n.t("conversation-newMessage")}</Title>
        <HeaderAction
          onPress={() =>
            this.props.pickedUsers.length > 0 && this.handleCreateThread()
          }
          disabled={this.props.pickedUsers.length === 0}
        >
          {I18n.t("next")}
        </HeaderAction>
      </Header>
    );
  }
}

export default connect(
  (state: any) => {
    const usersState = state[mailboxConfig.reducerName].users;
    return {
      pickedUsers: usersState.picked
    };
  },
  dispatch => ({
    createThread: pickedUsers => dispatch<any>(createThread(pickedUsers))
  })
)(NewThreadPageHeader);
