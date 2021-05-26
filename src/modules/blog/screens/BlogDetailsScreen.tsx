import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { ThunkDispatch } from "redux-thunk";
import { connect } from "react-redux";

import type { IGlobalState } from "../../../AppStore";
import type { IBlog_State } from "../reducer";

import moduleConfig from "../moduleConfig";
import withViewTracking from "../../../framework/tracker/withViewTracking";
import { Text } from "../../../framework/components/text";
import { PageView } from "../../../framework/components/page";
import { IResourceUriNotification, ITimelineNotification } from "../../../framework/notifications";

// TYPES ==========================================================================================

export interface IBlogDetailsScreenDataProps {
    // Add data props here
};
export interface IBlogDetailsScreenEventProps {
    // Add event-props here
};
export interface IBlogDetailsScreenNavParams {
    notification: ITimelineNotification & IResourceUriNotification;
};
export type IBlogDetailsScreenProps = IBlogDetailsScreenDataProps
    & IBlogDetailsScreenEventProps
    & NavigationInjectedProps<Partial<IBlogDetailsScreenNavParams>>;

export interface IBlogDetailsScreenState {
    // Add local state here
};

// COMPONENT ======================================================================================

export class BlogDetailsScreen extends React.PureComponent<
    IBlogDetailsScreenProps,
    IBlogDetailsScreenState
    > {

    // DECLARATIONS =================================================================================

    state: IBlogDetailsScreenState = {
        // Add local state default values here
    }

    // RENDER =======================================================================================

    render() {
        return <>
            <PageView>
                <Text>BlogDetails content</Text>
                <Text>{this.props.navigation.getParam('notification')?.id}</Text>
            </PageView>
        </>;
    }

    // LIFECYCLE ====================================================================================

    constructor(props: IBlogDetailsScreenProps) {
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

const mapStateToProps: (s: IGlobalState) => IBlogDetailsScreenDataProps = (s) => {
    let ts = moduleConfig.getState(s) as IBlog_State;
    return {
        // Add data props here
    };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => IBlogDetailsScreenEventProps
    = (dispatch, getState) => ({
        // Add event props here
    })

const DummyScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(BlogDetailsScreen);
export default withViewTracking("dummy")(DummyScreen_Connected);
