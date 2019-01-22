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
import { IConversationReceiverList } from "../reducers";

const mapStateToProps: (state: any) => IReceiverListPageDataProps = state => {
    const receiverState: IConversationReceiverList = state[conversationConfig.reducerName].receiversDisplay;
    // prepare receivers array
    const toReceivers = receiverState.to.map((value) => ({ ...value, checked: false, displayName: value.name }))
    const ccReceivers = receiverState.cc.map((value) => ({ ...value, checked: false, displayName: value.name }))
    return {
        toReceivers, ccReceivers, sender: { ...receiverState.from, checked: false, displayName: receiverState.from.name }
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