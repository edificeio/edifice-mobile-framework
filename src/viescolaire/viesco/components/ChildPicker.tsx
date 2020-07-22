/* eslint-disable flowtype/no-types-missing-file-annotation */
import * as React from "react";
import { View, StyleSheet } from "react-native";

import { CommonStyles } from "../../../styles/common/styles";
import Dropdown from "../../../ui/Dropdown";
import { IChildArray, IChild } from "../state/children";

const styles = StyleSheet.create({
  shadow: {
    elevation: CommonStyles.elevation,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
  },
  container: {
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    backgroundColor: "#FFFFFF",
    zIndex: 100,
  },
  innerContainer: {
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
});

export interface ChildPickerProps {
  selectedChild: string;
  childrenArray: IChildArray;
  selectChild: (t: string) => void;
}

export default class ChildPicker extends React.PureComponent<ChildPickerProps> {
  public render() {
    const { selectedChild, childrenArray, selectChild, children } = this.props;

    const dropdown = (
      <Dropdown
        data={Object.values(childrenArray)}
        value={selectedChild}
        onSelect={(child: string) => selectChild(child)}
        keyExtractor={item => keyExtractor(item)}
        renderItem={(item: IChild) => item.lastName + " " + item.firstName}
      />
    );
    const keyExtractor = child =>
      Object.keys(childrenArray)[Object.values(childrenArray).findIndex(item => item === child)];

    const wrappedChildren = React.Children.map([dropdown, ...React.Children.toArray(children)], child =>
      React.cloneElement(child as React.ReactElement<any>, { style: [child.props.style, { margin: 5 }] })
    );

    return (
      <View style={[styles.container, styles.shadow]}>
        <View style={styles.innerContainer}>{wrappedChildren}</View>
      </View>
    );
  }
}
