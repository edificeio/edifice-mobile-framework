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

// TYPES ==========================================================================================

export interface IDummyScreenDataProps {
    // Add data props here
};
export interface IDummyScreenEventProps {
    // Add event-props here
};
export type IDummyScreenProps = IDummyScreenDataProps
    & IDummyScreenEventProps
    & NavigationInjectedProps;

export interface IDummyScreenState {
    // Add local state here
};

// COMPONENT ======================================================================================

export class DummyScreen extends React.PureComponent<
    IDummyScreenProps,
    IDummyScreenState
    > {

    // DECLARATIONS =================================================================================

    state: IDummyScreenState = {
        // Add local state default values here
    }

    // RENDER =======================================================================================

    render() {
        return <>
            <PageView>
                <Text>DummyScreen content</Text>
            </PageView>
        </>;
    }

    // LIFECYCLE ====================================================================================

    constructor(props: IDummyScreenProps) {
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

const mapStateToProps: (s: IGlobalState) => IDummyScreenDataProps = (s) => {
    let ts = moduleConfig.getState(s) as IBlog_State;
    return {
        // Add data props here
    };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => IDummyScreenEventProps
    = (dispatch, getState) => ({
        // Add event props here
    })

const DummyScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(DummyScreen);
export default withViewTracking("dummy")(DummyScreen_Connected);
