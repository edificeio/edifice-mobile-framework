import I18n from "i18n-js";
import * as React from "react";
import { connect } from "react-redux";
import {
    IReceiverListPageDataProps,
    IReceiverListPageEventProps,
    ReceiverListPage,
    IReceiverListPageProps
} from "../components/ReceiverListPage";
import conversationConfig from "../config";
import { IConversationReceiverList } from "../reducers";
import { alternativeNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { NavigationScreenProp } from "react-navigation";
import { HeaderBackAction } from "../../ui/headers/NewHeader";
import withViewTracking from "../../infra/tracker/withViewTracking";

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

    static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
        return alternativeNavScreenOptions(
            {
                title: navigation.getParam('title') || I18n.t("conversation-receiverList"),
                headerLeft: <HeaderBackAction navigation={navigation} />,
                headerStyle: {
                    overflow: "hidden"
                },
            },
            navigation
        );
    };

    public render() {
        return (
            <ReceiverListPage
                {...this.props}
            />
        );
    }

}

const ReceiverListPageContainerConnected = connect(
    mapStateToProps,
    mapDispatchToProps
)(ReceiverListPageContainer);

export default withViewTracking("conversation/receivers")(ReceiverListPageContainerConnected);
