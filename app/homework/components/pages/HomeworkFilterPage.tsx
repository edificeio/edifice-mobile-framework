/**
 * HomeworkFilterPage
 *
 * Display page of a single task with all its content.
 *
 * Props:
 *    `diaryList` - Data list
 *    `selectedDiaryId`
 *    `isFetching` - is data currently fetching from backend
 *
 *    `onRefresh` - fires when the user ask for refresh the list
 *    `onSelect` - fires when the user touch a diary name in the list
 *
 *    `dispatch` - React-Redux dispatcher
 *    `navigation` - React Navigation
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

// Main component ---------------------------------------------------------------------------------

export interface IHomeworkFilterPageDataProps {
  diaryList?: Array<{
    id: string;
    title: string;
    name: string;
  }>;
  selectedDiaryId?: string;
  isFetching?: boolean;
}

export interface IHomeworkFilterPageEventProps {
  onRefresh: () => void;
  onSelect: (diaryId: string, trackingKeyword?: string) => void;
}

export interface IHomeworkFilterPageOtherProps {
  navigation?: any;
}

export type IHomeworkFilterPageProps = IHomeworkFilterPageDataProps &
  IHomeworkFilterPageEventProps &
  IHomeworkFilterPageOtherProps;

// tslint:disable-next-line:max-classes-per-file
export class HomeworkFilterPage extends React.PureComponent<
  IHomeworkFilterPageProps,
  {}
> {
  private flatList: FlatList<string>; /* TS-ISSUE : FlatList is declared in glamorous */ // react-native FlatList component ref
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
    const { diaryList, selectedDiaryId, isFetching, onRefresh } = this.props;

    return (
      <PageContainer>
        <ConnectionTrackingBar />
        <FlatList
          innerRef={this.setFlatListRef}
          data={diaryList}
          renderItem={({ item }) => (
            <ListItem
              style={{ justifyContent: "space-between" }}
              onPress={() =>
                this.handleSelectedHomeworkChanged(item.id, item.title)
              }
            >
              <Bold>{item.title}</Bold>
              <Checkbox
                checked={selectedDiaryId === item.id}
                onCheck={() =>
                  this.handleSelectedHomeworkChanged(item.id, item.title)
                }
              />
            </ListItem>
          )}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={() => onRefresh()}
            />
          }
        />
      </PageContainer>
    );
  }

  // Event Handlers

  public handleSelectedHomeworkChanged = (diaryId, diaryTitle) => {
    this.props.onSelect(diaryId, diaryTitle);
    this.props.navigation.goBack(); // TODO : Should the navigation be in mapDispatchToProps or not ?
  } /* TS-ISSUE: Syntax error on this line because of a collision between TSlint and Prettier. */
}

export default HomeworkFilterPage;
