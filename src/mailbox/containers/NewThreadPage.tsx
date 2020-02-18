import * as React from "react";
import { connect } from "react-redux";
import I18n from "i18n-js";

import { loadVisibles, createThread } from "../actions/createThread";
import { pickUser, unpickUser, clearPickedUsers } from "../actions/pickUser";

import { IUser } from "../../user/reducers";

import { PageContainer } from "../../ui/ContainerContent";
import SelectThreadInfos from "../../ui/SelectThreadInfos";

import mailboxConfig from "../config";
import { NavigationScreenProp } from "react-navigation";
import { alternativeNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderBackAction, HeaderAction } from "../../ui/headers/NewHeader";
import { Dispatch, AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import conversationThreadSelected from "../actions/threadSelected";
import { selectSubject, clearSubject } from "../actions/selectSubject";

interface INewThreadPageProps {
  remainingUsers: IUser[];
  loadVisibles: () => Promise<void>;
  pickedUsers: IUser[];
  subject: string;
  selectSubject: (subject: string) => void;
  pickUser: (user: IUser) => void;
  unpickUser: (user: IUser) => void;
  clearPickedUsers: () => Promise<void>;
  clearSubject: () => Promise<void>;
  navigation: NavigationScreenProp<{}>
  createAndSelectThread: (pickedUsers: any[], threadSubject?: string) => any;
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
    const threadInfo = this.props.createAndSelectThread(this.props.pickedUsers, this.props.subject);
    this.props.navigation.replace("thread", { threadInfo });
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

  public componentWillUnmount() {
    this.props.clearPickedUsers();
    this.props.clearSubject();
  }

  public render() {
    return (
      <PageContainer>
        <SelectThreadInfos
          onSelectSubject={(subject: string) => {
            this.props.selectSubject(subject);
          }}
          onPickUser={(user: any) => {
            this.props.pickUser(user);
          }}
          onUnpickUser={(user: any) => {
            this.props.unpickUser(user);
          }}
          pickedUsers={this.props.pickedUsers}
          remainingUsers={this.props.remainingUsers}
        />
      </PageContainer>
    );
  }
}

export default connect(
  (state: any) => {
    // console.log(state);
    const subjectState = state[mailboxConfig.reducerName].subject;
    const usersState = state[mailboxConfig.reducerName].users;
    return {
      subject: subjectState,
      pickedUsers: usersState.picked,
      remainingUsers: usersState.remaining
    };
  },
  (dispatch: Dispatch & ThunkDispatch<any, void, AnyAction>) => ({
    loadVisibles: () => loadVisibles(dispatch)(),
    selectSubject: (subject: string) => selectSubject(dispatch)(subject),
    pickUser: (user: any) => pickUser(dispatch)(user),
    unpickUser: (user: any) => unpickUser(dispatch)(user),
    clearPickedUsers: () => clearPickedUsers(dispatch)(),
    clearSubject: () => clearSubject(dispatch)(),
    createAndSelectThread: (pickedUsers: any[], threadSubject: string) => {
      const newConversation = dispatch(createThread(pickedUsers, threadSubject))
      dispatch(conversationThreadSelected(newConversation.id))
      return newConversation
    }
  })
)(NewThreadPage);
