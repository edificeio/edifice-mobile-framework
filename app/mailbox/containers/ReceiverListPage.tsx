import * as React from "react";
import { connect } from "react-redux";
import {
    IReceiverListPageDataProps,
    IReceiverListPageEventProps,
    IReceiverListPageOtherProps,
    ReceiverListPage,
    IReceiverListPageProps
} from "../components/ReceiverListPage";
import conversationConfig from "../config";
import { IConversationMessageList } from "../reducers";

const mapStateToProps: (state: any) => IReceiverListPageDataProps = state => {
    // Extract data from state
    const localState: IConversationMessageList = state[conversationConfig.reducerName].messages.data;
    const messageId: string = state[conversationConfig.reducerName].receiversDisplay;
    const message = localState[messageId];
    // prepare receivers array
    const receivers: Array<{ id: string, name: string, displayName: string, checked: boolean }> = [];
    message.to.forEach((value, index) => receivers.push({
        id: value,
        displayName: message.toName[index],
        name: message.toName[index],
        checked: false
    }));
    return {
        receivers
    };
};

const mapDispatchToProps: (
    dispatch: any
) => IReceiverListPageEventProps = dispatch => {
    return {
        dispatch
    };
};

class ReceiverListPageContainer extends React.PureComponent<IReceiverListPageProps & { dispatch: any }, {}> {
    public render() {
        return (
            <ReceiverListPage
                {...this.props}
            />
        );
    }

}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ReceiverListPageContainer);