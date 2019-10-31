import * as React from "react";
import { connect } from "react-redux";
import I18n from "i18n-js";

import { loadVisibles, createThread } from "../actions/createThread";
import { pickUser, unpickUser } from "../actions/pickUser";

import { IUser } from "../../user/reducers";

import { PageContainer } from "../../ui/ContainerContent";
import SearchUser from "../../ui/SearchUser";

import mailboxConfig from "../config";
import { NavigationScreenProp } from "react-navigation";
import { alternativeNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderBackAction, HeaderAction } from "../../ui/headers/NewHeader";
import { Dispatch, AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import conversationThreadSelected from "../actions/threadSelected";

interface INewThreadPageProps {
  remainingUsers: IUser[];
  loadVisibles: () => Promise<void>;
  pickedUsers: IUser[];
  pickUser: (user: IUser) => void;
  unpickUser: (user: IUser) => void;
  navigation: NavigationScreenProp<{}>
  createAndSelectThread: (pickedUsers: any) => any;
}

class NewThreadPage extends React.PureComponent<
  INewThreadPageProps,
  undefined
> {
  static navigationOptions = ({ navigation, screenProps }: { navigation: NavigationScreenProp<{}>, screenProps: INewThreadPageProps }) => {
    return alternativeNavScreenOptions({
      title: I18n.t("conversation-newMessage"),
      headerLeft: <HeaderBackAction navigation={navigation} />,
      headerRight: <HeaderAction
        title={I18n.t("next")}
        disabled={!navigation.getParam("canCreate", false)}
        onPress={() => { navigation.getParam("canCreate", false) && navigation.getParam("onCreate")() }}
      />,
    }, navigation);
  }

  constructor(props: INewThreadPageProps) {
    super(props);
    // Header events setup
    this.props.navigation.setParams({
      canCreate: false,
      onCreate: this.handleCreateThread.bind(this)
    });
  }

  public componentDidMount() {
    this.props.loadVisibles();
  }

  public handleCreateThread() {
    this.props.createAndSelectThread(this.props.pickedUsers);
    this.props.navigation.replace("thread");
  }

  public updateHeaderProps() {
    this.props.navigation.setParams({
      canCreate: this.props.pickedUsers.length > 0
    })
  }

  public getSnapshotBeforeUpdate(prevProps: INewThreadPageProps, prevState: any) {
    if (prevProps.pickedUsers !== this.props.pickedUsers) {
      this.updateHeaderProps();
    }
    return null;
  }

  public componentDidUpdate() {} // ComponentDidUpdate must exist if getSnapshotBeforeUpdate() does.

  public render() {
    return (
      <PageContainer>
        <SearchUser
          remaining={this.props.remainingUsers}
          picked={this.props.pickedUsers}
          onPickUser={(user: any) => {
            this.props.pickUser(user);
          }}
          onUnpickUser={(user: any) => {
            this.props.unpickUser(user);
          }}
        />
      </PageContainer>
    );
  }
}

export default connect(
  (state: any) => {
    // console.log(state);
    const usersState = state[mailboxConfig.reducerName].users;
    return {
      pickedUsers: usersState.picked,
      remainingUsers: usersState.remaining
    };
  },
  (dispatch: Dispatch & ThunkDispatch<any, void, AnyAction>) => ({
    loadVisibles: () => loadVisibles(dispatch)(),
    pickUser: (user: any) => pickUser(dispatch)(user),
    unpickUser: (user: any) => unpickUser(dispatch)(user),
    createAndSelectThread: (pickedUsers: any[]) => {
      const newConversation = dispatch(createThread(pickedUsers))
      dispatch(conversationThreadSelected(newConversation.id))
    }
  })
)(NewThreadPage);
