/**
 * ThreadListPage
 *
 * Display page for all threads.
 *
 * Props :
 *    `isFetching` - is data currently fetching from the server.
 *
 *    `navigation` - React Navigation instance.
 */

// Imports ----------------------------------------------------------------------------------------

// Libraries
import style from "glamorous-native";
import * as React from "react";
import I18n from "react-native-i18n";
import ViewOverflow from "react-native-view-overflow";

import moment from "moment";
// tslint:disable-next-line:no-submodule-imports
import "moment/locale/fr";
moment.locale("fr");

// Components
import { RefreshControl } from "react-native";
const { View, FlatList } = style;

import { Loading } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { EmptyScreen } from "../../ui/EmptyScreen";

// Type definitions

// Misc

// Props definition -------------------------------------------------------------------------------

export interface IThreadListPageDataProps {
  isFetching?: boolean;
}

export interface IThreadListPageEventProps {}

export interface IThreadListPageOtherProps {
  navigation?: any;
}

export type IThreadListPageProps = IThreadListPageDataProps &
  IThreadListPageEventProps &
  IThreadListPageOtherProps;

// Main component ---------------------------------------------------------------------------------

export class ThreadListPage extends React.PureComponent<
  IThreadListPageProps,
  {}
> {
  constructor(props) {
    super(props);
  }

  // Render

  public render() {
    const pageContent = null; // TODO compute page content

    return (
      <PageContainer>
        <ConnectionTrackingBar />
        {pageContent}
      </PageContainer>
    );
  }

  // Lifecycle

  // Event Handlers
}

export default ThreadListPage;
