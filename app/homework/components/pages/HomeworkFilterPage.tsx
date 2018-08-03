/**
 * HomeworkFilterPage
 *
 * Display page for just one task just one day.
 *
 * Props:
 *    `navigation` - React Navigation
 *    `dispatch` - React-Redux dispatcher
 *    `homeworkList` - Data list
 *    `selectedHomeworkId`
 *    `isFetching` - is data currently fetching from backend
 */

// imports ----------------------------------------------------------------------------------------

import style from "glamorous-native";
import * as React from "react";
const { FlatList } = style;
import { RefreshControl } from "react-native";

import { ListItem, PageContainer } from "../../../ui/ContainerContent";

import ConnectionTrackingBar from "../../../ui/ConnectionTrackingBar";
import { Checkbox } from "../../../ui/forms/Checkbox";
import { Bold } from "../../../ui/Typography";
import { fetchHomeworkList, fetchHomeworkListIfNeeded } from "../../actions/list";
import { homeworkSelected } from "../../actions/selected";

// Main component ---------------------------------------------------------------------------------

export interface IHomeworkFilterPageProps {
  navigation?: any;
  dispatch?: any; // given by connect()
  homeworkList?: Array<{
    id: string;
    title: string;
    name: string;
  }>;
  selectedHomeworkId?: string;
  isFetching?: boolean;
}

// tslint:disable-next-line:max-classes-per-file
export class HomeworkFilterPage extends React.PureComponent<
  IHomeworkFilterPageProps,
  {}
> {
  private flatList: FlatList<string>; // react-native FlatList component ref // TS-ISSUE FlatList exists.
  private setFlatListRef: any; // FlatList setter, executed when this component is mounted.

  constructor(props) {
    super(props);

    // Refs
    this.flatList = null;
    this.setFlatListRef = element => {
      this.flatList = element;
    };
  }

  // render & lifecycle

  public render() {
    return (
      <PageContainer>
        <ConnectionTrackingBar />
        <FlatList
          innerRef={this.setFlatListRef}
          data={this.props.homeworkList}
          renderItem={({ item }) => (
            <ListItem
              style={{ justifyContent: "space-between" }}
              onPress={() => this.handleSelectedHomeworkChanged(item.id)}
            >
              <Bold>{item.title}</Bold>
              <Checkbox
                checked={this.props.selectedHomeworkId === item.id}
                onCheck={() => this.handleSelectedHomeworkChanged(item.id)}
              />
            </ListItem>
          )}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={this.props.isFetching}
              onRefresh={() => this.forceFetchHomeworkList()}
            />
          }
        />
      </PageContainer>
    );
  }

  // Lifecycle

  public componentDidMount() {
    this.fetchHomeworkList();
  }

  // Fetch methods

  public fetchHomeworkList() {
    this.props.dispatch(fetchHomeworkListIfNeeded());
  }

  public forceFetchHomeworkList() {
    this.props.dispatch(fetchHomeworkList());
  }

  // Event Handlers

  public handleSelectedHomeworkChanged = homeworkId => {
    this.props.dispatch(homeworkSelected(homeworkId));
    this.props.navigation.goBack();
  } // TS-ISSUE: Syntax error on this line because of a collision between TSlint and Prettier.
}

export default HomeworkFilterPage;
