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
const { FlatList, View } = style;
import { RefreshControl } from "react-native";
import I18n from "i18n-js";

import { ListItem, PageContainer } from "../../../ui/ContainerContent";

import { Loading } from "../../../ui";
import ConnectionTrackingBar from "../../../ui/ConnectionTrackingBar";
import { EmptyScreen } from "../../../ui/EmptyScreen";
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
    const pageContent = this.props.diaryList
      ? this.props.diaryList.length === 0
        ? this.props.isFetching
          ? this.renderLoading()
          : this.renderEmptyScreen()
        : this.renderList()
      : this.renderLoading();

    return (
      <PageContainer>
        <ConnectionTrackingBar />
        {pageContent}
      </PageContainer>
    );
  }

  private renderList() {
    const { diaryList, selectedDiaryId, isFetching, onRefresh } = this.props;
    return (
      <FlatList
        innerRef={this.setFlatListRef}
        data={diaryList}
        renderItem={({ item }) => (
          <ListItem
            style={{
              alignItems: "stretch",
              justifyContent: "space-between",
              width: "100%"
            }}
            onPress={() =>
              this.handleSelectedHomeworkChanged(item.id, item.title)
            }
          >
            <View
              style={{
                flex: 1,
                paddingRight: 4
              }}
            >
              <Bold>{item.title}</Bold>
            </View>
            <View style={{ justifyContent: "center" }}>
              <Checkbox
                checked={selectedDiaryId === item.id}
                onCheck={() =>
                  this.handleSelectedHomeworkChanged(item.id, item.title)
                }
              />
            </View>
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
    );
  }

  private renderEmptyScreen() {
    return (
      <EmptyScreen
        imageSrc={require("../../../../assets/images/empty-screen/homework.png")}
        imgWidth={265.98}
        imgHeight={279.97}
        text={I18n.t("homework-emptyScreenText")}
        title={I18n.t("homework-emptyScreenTitle")}
      />
    );
  }

  private renderLoading() {
    return <Loading />;
  }

  // Event Handlers

  public handleSelectedHomeworkChanged = (diaryId, diaryTitle) => {
    this.props.onSelect(diaryId, diaryTitle);
    this.props.navigation.goBack(); // TODO : Should the navigation be in mapDispatchToProps or not ?
  } /* TS-ISSUE: Syntax error on this line because of a collision between TSlint and Prettier. */
}

export default HomeworkFilterPage;
