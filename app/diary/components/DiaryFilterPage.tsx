/**
 * DiaryFilterPage
 *
 * Display page for just one task just one day.
 *
 * Props:
 *    `navigation` - React Navigation
 *    `dispatch` - React-Redux dispatcher
 *    `diaryList` - Data list
 *    `selectedDiaryId`
 *    `isFetching` - is data currently fetching from backend
 */

// imports ----------------------------------------------------------------------------------------

import style from "glamorous-native";
import * as React from "react";
const { FlatList } = style;
import { RefreshControl } from "react-native";

import { ListItem, PageContainer } from "../../ui/ContainerContent";

import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { Checkbox } from "../../ui/forms/Checkbox";
import { Bold } from "../../ui/Typography";
import { fetchDiaryList, fetchDiaryListIfNeeded } from "../actions/list";
import { diarySelected } from "../actions/selected";

// Main component ---------------------------------------------------------------------------------

export interface IDiaryFilterPageProps {
  navigation?: any;
  dispatch?: any; // given by connect()
  diaryList?: Array<{
    id: string;
    title: string;
    name: string;
  }>;
  selectedDiaryId?: string;
  isFetching?: boolean;
}

// tslint:disable-next-line:max-classes-per-file
export class DiaryFilterPage extends React.PureComponent<
  IDiaryFilterPageProps,
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
          data={this.props.diaryList}
          renderItem={({ item }) => (
            <ListItem
              style={{ justifyContent: "space-between" }}
              onPress={() => this.handleSelectedDiaryChanged(item.id)}
            >
              <Bold>{item.title}</Bold>
              <Checkbox
                checked={this.props.selectedDiaryId === item.id}
                onCheck={() => this.handleSelectedDiaryChanged(item.id)}
              />
            </ListItem>
          )}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={this.props.isFetching}
              onRefresh={() => this.forceFetchDiaryList()}
            />
          }
        />
      </PageContainer>
    );
  }

  // Lifecycle

  public componentDidMount() {
    this.fetchDiaryList();
  }

  // Fetch methods

  public fetchDiaryList() {
    this.props.dispatch(fetchDiaryListIfNeeded());
  }

  public forceFetchDiaryList() {
    this.props.dispatch(fetchDiaryList());
  }

  // Event Handlers

  public handleSelectedDiaryChanged = diaryId => {
    this.props.dispatch(diarySelected(diaryId));
    this.props.navigation.goBack();
  } // TS-ISSUE: Syntax error on this line because of a collision between TSlint and Prettier.
}

export default DiaryFilterPage;
