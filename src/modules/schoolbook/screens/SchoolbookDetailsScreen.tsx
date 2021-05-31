import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { ThunkDispatch } from "redux-thunk";
import { connect } from "react-redux";

import type { IGlobalState } from "../../../AppStore";
import type { ISchoolbook_State } from "../reducer";

import moduleConfig from "../moduleConfig";
import withViewTracking from "../../../framework/tracker/withViewTracking";
import { Text } from "../../../framework/components/text";
import { PageView } from "../../../framework/components/page";
import { IResourceUriNotification, ITimelineNotification } from "../../../framework/notifications";

// TYPES ==========================================================================================

export interface ISchoolbookDetailsScreenDataProps {
    // Add data props here
};
export interface ISchoolbookDetailsScreenEventProps {
    // Add event-props here
};
export interface ISchoolbookDetailsScreenNavParams {
    notification: ITimelineNotification & IResourceUriNotification;
};
export type ISchoolbookDetailsScreenProps = ISchoolbookDetailsScreenDataProps
    & ISchoolbookDetailsScreenEventProps
    & NavigationInjectedProps<Partial<ISchoolbookDetailsScreenNavParams>>;

export interface ISchoolbookDetailsScreenState {
    // Add local state here
};

// COMPONENT ======================================================================================

export class SchoolbookDetailsScreen extends React.PureComponent<
    ISchoolbookDetailsScreenProps,
    ISchoolbookDetailsScreenState
    > {

    // DECLARATIONS =================================================================================

    state: ISchoolbookDetailsScreenState = {
        // Add local state default values here
    }

    // RENDER =======================================================================================

    render() {
        return <>
            <PageView>
                <Text>SchoolbookDetails content</Text>
                <Text>{this.props.navigation.getParam('notification')?.id}</Text>
            </PageView>
        </>;
    }

    // LIFECYCLE ====================================================================================

    constructor(props: ISchoolbookDetailsScreenProps) {
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

const mapStateToProps: (s: IGlobalState) => ISchoolbookDetailsScreenDataProps = (s) => {
    let ts = moduleConfig.getState(s) as ISchoolbook_State;
    return {
        // Add data props here
    };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => ISchoolbookDetailsScreenEventProps
    = (dispatch, getState) => ({
        // Add event props here
    })

const SchoolbookDetailsScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(SchoolbookDetailsScreen);
export default withViewTracking("schoolbook")(SchoolbookDetailsScreen_Connected);
