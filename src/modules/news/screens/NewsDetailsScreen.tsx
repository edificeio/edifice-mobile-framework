import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { ThunkDispatch } from "redux-thunk";
import { connect } from "react-redux";

import type { IGlobalState } from "../../../AppStore";
import type { INews_State } from "../reducer";

import moduleConfig from "../moduleConfig";
import withViewTracking from "../../../framework/tracker/withViewTracking";
import { Text } from "../../../framework/components/text";
import { PageView } from "../../../framework/components/page";
import { IResourceUriNotification, ITimelineNotification } from "../../../framework/notifications";

// TYPES ==========================================================================================

export interface INewsDetailsScreenDataProps {
    // Add data props here
};
export interface INewsDetailsScreenEventProps {
    // Add event-props here
};
export interface INewsDetailsScreenNavParams {
    notification: ITimelineNotification & IResourceUriNotification;
};
export type INewsDetailsScreenProps = INewsDetailsScreenDataProps
    & INewsDetailsScreenEventProps
    & NavigationInjectedProps<Partial<INewsDetailsScreenNavParams>>;

export interface INewsDetailsScreenState {
    // Add local state here
};

// COMPONENT ======================================================================================

export class NewsDetailsScreen extends React.PureComponent<
    INewsDetailsScreenProps,
    INewsDetailsScreenState
    > {

    // DECLARATIONS =================================================================================

    state: INewsDetailsScreenState = {
        // Add local state default values here
    }

    // RENDER =======================================================================================

    render() {
        return <>
            <PageView>
                <Text>NewsDetails content</Text>
                <Text>{this.props.navigation.getParam('notification')?.id}</Text>
            </PageView>
        </>;
    }

    // LIFECYCLE ====================================================================================

    constructor(props: INewsDetailsScreenProps) {
        super(props);
    }

    // METHODS ======================================================================================

    async doSomething() {
        // Add component functionality here
    }

    async goToSomewhere(){
        // Add dispatch navigation event here
    }
}

// UTILS ==========================================================================================

    // Add some util functions here

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => INewsDetailsScreenDataProps = (s) => {
    let ts = moduleConfig.getState(s) as INews_State;
    return {
        // Add data props here
    };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => INewsDetailsScreenEventProps
    = (dispatch, getState) => ({
        // Add event props here
    })

const NewsDetailsScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(NewsDetailsScreen);
export default withViewTracking("news")(NewsDetailsScreen_Connected);
