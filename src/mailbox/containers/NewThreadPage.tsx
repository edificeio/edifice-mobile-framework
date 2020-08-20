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
import withViewTracking from "../../infra/tracker/withViewTracking";
import { IConversationMessage, IConversationThread } from "../reducers";
import { getSessionInfo } from "../../App";

interface INewThreadPageProps {
  remainingUsers: IUser[];
  loadVisibles: () => Promise<void>;
  pickedUsers: IUser[];
  subject: string;
  message?: IConversationMessage;
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
    const type = navigation.getParam('type', 'new');
    return alternativeNavScreenOptions({
      title: I18n.t({
        'new': "conversation-newMessage",
        'reply': "conversation-reply",
        'transfer': "conversation-transfer"
      }[type] || "conversation-newMessage"),
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

  public async componentDidMount() {
    const { loadVisibles, selectSubject, pickUser, navigation } = this.props;
    // Setup from navigation params
    if (navigation.getParam('message')) {
      const message: IConversationMessage = navigation.getParam('message');
      const type: string = navigation.getParam('type', 'new');
      const replyToAll: boolean = navigation.getParam('replyToAll');
      // Subject
      let subject: string | undefined = undefined;
      if (message.subject) {
        if (type === 'reply') {
          subject = message.subject.startsWith("Re: ") ? message.subject : "Re: " + message.subject;
        } else if (type === 'transfer') {
          subject = message.subject.startsWith("Tr: ") ? message.subject : "Tr: " + message.subject;
        }
      }
      subject && selectSubject && selectSubject(subject);
      // Receivers
      if (type === 'reply') {
        const allIds =  replyToAll ? NewThreadPage.findReceivers2(message) : [message.from];
        const receivers: IUser[] = allIds ? (allIds as string[]).map(uid => ({
          userId: uid,
          displayName: (() => {
            const dn: [string, string, boolean] | undefined = message.displayNames ? (message.displayNames as Array<[string, string, boolean]>).find(e => e[0] === uid) : undefined;
            return dn ? dn[1] : undefined;
          })()
        })).filter(e => e.displayName) as IUser[] : [];
        await loadVisibles();
        receivers.forEach(u => pickUser(u));
      }
    }
  }

  public static findReceivers2(
    conversation: IConversationThread | IConversationMessage
  ) {
    // TODO : Duplicate of ThreadItem.findReceivers() ?
    const to = new Set(
      [
        ...conversation.to,
        ...(conversation.cc || []),
        conversation.from
      ].filter(el => el && el !== getSessionInfo().userId)
    );
    if (to.size === 0) {
      return [getSessionInfo().userId];
    }
    return [...to];
  }

  public handleCreateThread() {
    const threadInfo = this.props.createAndSelectThread(this.props.pickedUsers, this.props.subject);
    const message: IConversationMessage = this.props.navigation.getParam('message');
    const type: string = this.props.navigation.getParam('type', 'new');
    const parentThread = this.props.navigation.getParam('parentThread');
    const draft: string = this.props.navigation.getParam('draft');
    this.props.navigation.push("thread", { threadInfo, message, type, parentThread, draft });
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
          subject={this.props.subject}
          remainingUsers={this.props.remainingUsers}
          message={this.props.navigation.getParam('message')}
          type={this.props.navigation.getParam('type')}
        />
      </PageContainer>
    );
  }
}

const NewThreadPageConnected = connect(
  (state: any) => {
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

export default withViewTracking("conversation/new")(NewThreadPageConnected);
