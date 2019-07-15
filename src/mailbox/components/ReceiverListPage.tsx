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
import { IUser, UserListGroupped } from "../../ui/UserList";

// Props definition -------------------------------------------------------------------------------

export interface IReceiverListPageDataProps {
    sender: IUser
    toReceivers: IUser[]
    ccReceivers: IUser[]
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
    public renderList(receivers: { [id: string]: Array<IUser> }) {
        return <UserListGroupped selectable={false} users={receivers}
        />
    }
    public render() {
        const { ccReceivers = [], toReceivers = [], sender } = this.props;
        const total = ccReceivers.length + toReceivers.length;
        const receiverKey = toReceivers.length==1?  "conversation-receiverTo":  "conversation-receiversTo";
        const usersGroupped = { "conversation-receiversSender": [sender], [receiverKey]: toReceivers }
        if (ccReceivers.length > 0) {
            usersGroupped["conversation-receiversCC"] = ccReceivers;
        }
        return (
            <PageContainer>
                {total == 0 ? this.renderEmptyList() : this.renderList(usersGroupped)}
            </PageContainer>
        );
    }
}

export default ReceiverListPage;
