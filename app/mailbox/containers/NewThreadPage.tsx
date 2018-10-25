import * as React from "react";
import { connect } from "react-redux";

import { loadVisibles } from "../actions/createThread";
import { pickUser, unpickUser } from "../actions/pickUser";

import { IUser } from "../../user/reducers";

import { PageContainer } from "../../ui/ContainerContent";
import SearchUser from "../../ui/SearchUser";

import mailboxConfig from "../config";

interface INewThreadPageProps {
  remainingUsers: IUser[];
  loadVisibles: () => Promise<void>;
  pickedUsers: IUser[];
  pickUser: (user: IUser) => void;
  unpickUser: (user: IUser) => void;
}

class NewThreadPage extends React.PureComponent<
  INewThreadPageProps,
  undefined
> {
  public componentDidMount() {
    this.props.loadVisibles();
  }

  public render() {
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
    const usersState = state[mailboxConfig.reducerName].users;
    return {
      pickedUsers: usersState.picked,
      remainingUsers: usersState.remaining
    };
  },
  dispatch => ({
    loadVisibles: () => loadVisibles(dispatch)(),
    pickUser: user => pickUser(dispatch)(user),
    unpickUser: user => unpickUser(dispatch)(user)
  })
)(NewThreadPage);
