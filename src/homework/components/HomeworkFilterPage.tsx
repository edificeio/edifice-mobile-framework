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
import I18n from "i18n-js";
import * as React from "react";
const { FlatList, View } = style;
import { Linking, RefreshControl } from "react-native";

import { ListItem, PageContainer } from "../../ui/ContainerContent";

import { Loading } from "../../ui";
import DEPRECATED_ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { EmptyScreen } from "../../ui/EmptyScreen";
import { Checkbox } from "../../ui/forms/Checkbox";
import { TextBold } from "../../framework/components/text";
import { Trackers } from "../../framework/util/tracker";
import { getHomeworkWorkflowInformation } from "../rights";
import { IUserSession } from "../../framework/util/session";
import { DEPRECATED_getCurrentPlatform } from "~/framework/util/_legacy_appConf";

// Main component ---------------------------------------------------------------------------------

export interface IHomeworkFilterPageDataProps {
  diaryList?: Array<{
    id: string;
    title: string;
    name: string;
  }>;
  selectedDiaryId?: string;
  didInvalidate?: boolean;
  isFetching?: boolean;
}

export interface IHomeworkFilterPageEventProps {
  onRefresh: () => void;
  onSelect: (diaryId: string, trackingKeyword?: string) => void;
}

export interface IHomeworkFilterPageOtherProps {
  navigation?: any;
  session: IUserSession;
}

export type IHomeworkFilterPageProps = IHomeworkFilterPageDataProps &
  IHomeworkFilterPageEventProps &
  IHomeworkFilterPageOtherProps;

// tslint:disable-next-line:max-classes-per-file
export class HomeworkFilterPage extends React.PureComponent<
  IHomeworkFilterPageProps,
  {}
> {
  private flatList: FlatList<
    string
  >; /* TS-ISSUE : FlatList is declared in glamorous */ // react-native FlatList component ref
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
    const { isFetching, didInvalidate } = this.props;
    const pageContent = isFetching && didInvalidate
      ? this.renderLoading()
      : this.renderList();

    return (
      <PageContainer>
        <DEPRECATED_ConnectionTrackingBar />
        {pageContent}
      </PageContainer>
    );
  }

  private renderList() {
    const { diaryList, selectedDiaryId, isFetching, onRefresh, session } = this.props;
    const isEmpty = diaryList && diaryList.length === 0;
    const homeworkWorkflowInformation = getHomeworkWorkflowInformation(session);
    const hasCreateHomeworkResourceRight = homeworkWorkflowInformation && homeworkWorkflowInformation.create;
    return (
      <FlatList
        contentContainerStyle={isEmpty ? { flex: 1 } : null}
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
              <TextBold>{item.title}</TextBold>
            </View>
            <View style={{ justifyContent: "center" }}>
              <Checkbox
                checked={selectedDiaryId === item.id}
                onCheck={() =>
                  this.handleSelectedHomeworkChanged(item.id, item.title)
                }
                onUncheck={() =>
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
        ListEmptyComponent={
          <EmptyScreen
            imageSrc={require("~assets/images/empty-screen/homework.png")}
            imgWidth={265.98}
            imgHeight={279.97}
            text={I18n.t("homework-diaries-emptyScreenText")}
            title={I18n.t(`homework-${hasCreateHomeworkResourceRight ? "diaries" : "diaries-noCreationRight"}-emptyScreenTitle`)}
            buttonText={hasCreateHomeworkResourceRight ? I18n.t("homework-createDiary") : undefined}
            buttonAction={() => {
              //TODO: create generic function inside oauth (use in myapps, etc.)
              if (!DEPRECATED_getCurrentPlatform()) {
                console.warn("Must have a platform selected to redirect the user");
                return null;
              }
              const url = `${DEPRECATED_getCurrentPlatform()!.url}/homeworks`;
              Linking.canOpenURL(url).then(supported => {
                if (supported) {
                  Linking.openURL(url);
                } else {
                  console.warn("[homework] Don't know how to open URI: ", url);
                }
              });
              Trackers.trackEvent("Homework", "GO TO", "Create in Browser");
            }}
          />        
        }
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
  }; /* TS-ISSUE: Syntax error on this line because of a collision between TSlint and Prettier. */
}

export default HomeworkFilterPage;
