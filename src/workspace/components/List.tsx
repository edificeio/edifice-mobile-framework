// Libraries
import * as React from "react";
import { View, FlatList } from "react-native";

import { Text } from "../../ui/Typography";

// Main component ---------------------------------------------------------------------------------

export default class List extends React.PureComponent<any> {
  // Render

  private displayItem = ({item}) => {
    return (
      <View>
        <Text>{item.name}</Text>
      </View>
    );
  };

  public render() {
    return (
      <View>
        <FlatList data={Object.values(this.props.folders)} renderItem={this.displayItem} />
        <FlatList data={Object.values(this.props.documents)} renderItem={this.displayItem} />
      </View>
    );
  }
}
