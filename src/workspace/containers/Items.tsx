import * as React from "react";
import { FlatList, StyleSheet, View, ViewStyle } from "react-native";
import { connect } from "react-redux";
import I18n from "i18n-js";
import { bindActionCreators } from "redux";
import { NavigationScreenProp, NavigationEventSubscription } from "react-navigation";
import config from "../config";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderAction, HeaderIcon } from "../../ui/headers/NewHeader";
import { EVENT_TYPE, FilterId, IItem, IItemsProps, IState } from "../types";
import { Item } from "../components";
import { getList } from "../actions/list";
import { CommonStyles } from "../../styles/common/styles";
import { layoutSize } from "../../styles/common/layoutSize";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { getEmptyScreen } from "../utils/empty";
import { PageContainer } from "../../ui/ContainerContent";
import { Loading } from "../../ui";
import { removeAccents } from "../../utils/string";
import { pickFile } from "../../infra/actions/pickFile";
import { upload } from "../actions/upload";
import { withNavigationUploadWrapper } from "../utils/withNavigationUploadWrapper";
import { DocumentPickerResponse } from "react-native-document-picker";

const styles = StyleSheet.create({
  separator: {
    borderBottomColor: CommonStyles.borderColorLighter,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginLeft: layoutSize.LAYOUT_84,
  },
});

const HeaderBackAction = ({ navigation, style }: { navigation: NavigationScreenProp<{}>; style?: ViewStyle }) => {
  return <HeaderAction onPress={() => navigation.pop()} name={"back"} style={style} />;
};

export class Items extends React.Component<IItemsProps, { isFocused: boolean }> {
  redirected = false;
  focusListener!: NavigationEventSubscription;
  blurListener!: NavigationEventSubscription;

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    const headerRight =
      navigation.getParam("parentId") != FilterId.owner ? (
        <HeaderIcon name={null} hidden={true} />
      ) : (
        <HeaderAction name="plus" onPress={() => pickFile().then(navigation.state.params.upload)} />
      );

    return standardNavScreenOptions(
      {
        title: navigation.getParam("title") || I18n.t(config.displayName),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight,
      },
      navigation
    );
  };

  constructor(props: IItemsProps) {
    super(props);

    this.state = { isFocused: true };
  }

  public componentDidMount() {
    this.focusListener = this.props.navigation.addListener("willFocus", () => {
      this.setState({ isFocused: true });
      this.makeRequest();
    });
    this.blurListener = this.props.navigation.addListener("didBlur", () => {
      this.setState({ isFocused: false });
    });
    this.props.navigation.setParams({
      upload: this.upload.bind(this),
    });
  }

  upload(fileURI: DocumentPickerResponse) {
    if (fileURI) {
      const { uri, type, name } = fileURI;
      return this.props.upload([{ uri, mime: type, name, path: "" }]);
    } else {
      console.log("pick failed", fileURI);
    }
  }

  public componentWillUnmount() {
    this.focusListener.remove();
    this.blurListener.remove();
  }

  // permits to manage push notif navigation
  public shouldComponentUpdate() {
    if (!this.state.isFocused) {
      return false;
    } else {
      const childRoute = this.props.navigation.getParam("childRoute");
      const childParams = this.props.navigation.getParam("childParams");

      if (childRoute && !this.redirected) {
        this.redirected = true;
        this.props.navigation.push(childRoute, childParams);
        return false;
      }
      return true;
    }
  }

  public makeRequest() {
    this.props.getList({
      filter: this.props.navigation.getParam("filter"),
      parentId: this.props.navigation.getParam("parentId"),
    });
  }

  public onEvent(type: EVENT_TYPE, item: IItem) {
    const { id: parentId, name: title, isFolder } = item;
    const filterId = this.props.navigation.getParam("filter");

    switch (type) {
      case EVENT_TYPE.SELECT:
        const filter = filterId == FilterId.root ? parentId : filterId;

        isFolder
          ? this.props.navigation.push("Workspace", { filter, parentId, title })
          : this.props.navigation.push("WorkspaceDetails", { item, title });
        return;
    }
  }

  private sortItems(a: IItem, b: IItem): number {
    const sortByType = (a: IItem, b: IItem): number => {
      if (a.isFolder == b.isFolder) return 0;
      else return a.isFolder ? -1 : 1;
    };

    const sortByName = (a: IItem, b: IItem): number => {
      return removeAccents(a.name.toLocaleLowerCase()).localeCompare(removeAccents(b.name.toLocaleLowerCase()));
    };

    return sortByType(a, b) != 0 ? sortByType(a, b) : sortByName(a, b);
  }

  public render(): React.ReactNode {
    const { items, isFetching } = this.props;

    const getViewToRender = () => {
      if (items == undefined) {
        return <Loading />;
      } else {
        const values = Object.values(items);
        const parentId = this.props.navigation.getParam("parentId") || null;
        const itemsArray = parentId === FilterId.root ? values : values.sort(this.sortItems);

        return (
          <FlatList
            contentContainerStyle={{ flexGrow: 1 }}
            data={itemsArray}
            ListEmptyComponent={getEmptyScreen(parentId)}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyExtractor={(item: IItem) => item.id}
            refreshing={isFetching}
            onRefresh={() => this.makeRequest()}
            renderItem={({ item }) => <Item {...item} onEvent={this.onEvent.bind(this)} />}
          />
        );
      }
    };

    return (
      <PageContainer>
        <ConnectionTrackingBar />
        {getViewToRender()}
      </PageContainer>
    );
  }
}

const mapStateToProps = (state: any, props: any) => {
  const stateItems: IState = config.getLocalState(state).items;
  const parentId = props.navigation.getParam("parentId");
  const parentIdItems = stateItems[parentId] || {};
  const isFetching = parentIdItems.isFetching || false;
  const items = parentIdItems.data || {};

  return { items, isFetching };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({ getList, upload }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationUploadWrapper(Items));
