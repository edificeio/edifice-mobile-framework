// Libraries
import * as React from "react";
import { View, FlatList } from "react-native";
import Folder from "./Folder";
import File from "./File";

export default class List extends React.PureComponent<any> {

  public render() {
    return (
      <View>
        <FlatList data={Object.values(this.props.folders)} renderItem={({item}) => (<Folder {...item} navigate={this.props.navigate}/>)} />
        <FlatList data={Object.values(this.props.documents)} renderItem={({item}) => (<File {...item}/>)} />
      </View>
    );
  }
}
