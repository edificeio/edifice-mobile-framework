/**
 * DiaryFilterPage
 *
 * Display page for just one task just one day.
 */

// imports ----------------------------------------------------------------------------------------

import style from "glamorous-native";
import * as React from "react";
const { Text, FlatList } = style;
import { RefreshControl } from "react-native";

import { ListItem, PageContainer } from "../../ui/ContainerContent";
import { AppTitle, Header, HeaderIcon } from "../../ui/headers/Header";

import { connect } from "react-redux";

import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { Checkbox } from "../../ui/forms/Checkbox";
import { Bold } from "../../ui/Typography";
import { fetchDiaryList, fetchDiaryListIfNeeded } from "../actions/list";
import { diarySelected } from "../actions/selected";
import { Tracking } from "../../tracking/TrackingManager";

import I18n from "react-native-i18n";

// helpers ----------------------------------------------------------------------------------------

// Header component -------------------------------------------------------------------------------

// tslint:disable-next-line:max-classes-per-file
class DiaryFilterPageHeader_Unconnected extends React.Component<
  {
    navigation?: any;
    dispatch?: any; // given by connect()
  },
  undefined
> {
  public render() {
    const AppTitleStyled = style(AppTitle)({ textAlign: "left" });
    return (
      <Header>
        <HeaderIcon
          name="close"
          onPress={() => this.props.navigation.goBack()}
        />
        <AppTitleStyled>{I18n.t("diary-select")}</AppTitleStyled>
        <HeaderIcon name={null} hidden={true} />
      </Header>
    );
  }
}

export const DiaryFilterPageHeader = connect((state: any) => {
  // Map state to props
  return {};
})(DiaryFilterPageHeader_Unconnected);

// Main component ---------------------------------------------------------------------------------

interface IDiaryFilterPageProps {
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
class DiaryFilterPage_Unconnected extends React.Component<
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
              onPress={() => this.handleSelectedDiaryChanged(item.id,item.title)}
            >
              <Bold>{item.title}</Bold>
              <Checkbox
                checked={this.props.selectedDiaryId === item.id}
                onCheck={() => this.handleSelectedDiaryChanged(item.id,item.title)}
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

  public handleSelectedDiaryChanged = (diaryId, diaryTitle) => {
    this.props.dispatch(diarySelected(diaryId));
    Tracking.logEvent('selectNotebook', { tab: diaryTitle });
    this.props.navigation.goBack();
  } // FIXME: Syntax error on this line because of a collision between TSlint and Prettier.
}

export const DiaryFilterPage = connect((state: any) => {
  // Map state to props
  const localState = state.diary;
  const diaryList = localState.list;
  if (!diaryList.data)
    return {
      diaryList: [],
      isFetching: diaryList.isFetching,
      selectedDiaryId: localState.selected
    };
  // console.warn(diaryList.data);
  const flatDiaryList = Object.getOwnPropertyNames(diaryList.data).map(
    diaryId => ({
      id: diaryId,
      name: diaryList.data[diaryId].name,
      title: diaryList.data[diaryId].title
    })
  );
  // console.warn(flatDiaryList);
  return {
    diaryList: flatDiaryList,
    isFetching: diaryList.isFetching,
    selectedDiaryId: localState.selected
  };
})(DiaryFilterPage_Unconnected);

export default DiaryFilterPage;
