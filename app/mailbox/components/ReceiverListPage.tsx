/**
 * ThreadListPage
 *
 * Display page for all threads.
 *
 * Props :
 *    `isFetching` - is data currently fetching from the server.
 *    `isRefreshing` - is data currenty fetching in order to reset displayed list.
 *    `threads` - list of threads to display
 *
 *    `navigation` - React Navigation instance.
 */

// Imports ----------------------------------------------------------------------------------------

// Libraries
import style from "glamorous-native";
import * as React from "react";

import moment from "moment";
// tslint:disable-next-line:no-submodule-imports
import "moment/locale/fr";
moment.locale("fr");

// Components
const { View } = style;
import { PageContainer } from "../../ui/ContainerContent";

// Type definitions
import UserList, { IUser } from "../../ui/UserList";

// Props definition -------------------------------------------------------------------------------

export interface IReceiverListPageDataProps {
    receivers: IUser[]
}

export interface IReceiverListPageEventProps {
}

export interface IReceiverListPageOtherProps {
    navigation?: any;
}

export type IReceiverListPageProps = IReceiverListPageDataProps &
    IReceiverListPageEventProps &
    IReceiverListPageOtherProps;

// Main component ---------------------------------------------------------------------------------

export class ReceiverListPage extends React.PureComponent<
    IReceiverListPageProps
    > {

    // Render
    public renderEmptyList() {
        return <View />
    }
    public renderList(receivers: Array<IUser>) {
        return <UserList selectable={false} users={receivers}
        />
    }
    public render() {
        const { receivers } = this.props;
        return (
            <PageContainer>
                {receivers.length == 0 ? this.renderEmptyList() : this.renderList(receivers)}
            </PageContainer>
        );
    }
}

export default ReceiverListPage;
