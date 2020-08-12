/* eslint-disable flowtype/no-types-missing-file-annotation */
import * as React from "react";
import { View, StyleSheet } from "react-native";

import { CommonStyles } from "../../../styles/common/styles";
import { IChildArray, IChild } from "../state/children";
import Dropdown from "../../../ui/Dropdown";

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
        data={Object.entries(childrenArray).map(([childId, childValue]) => ({ id: childId, ...childValue }))}
        value={selectedChild}
        onSelect={(child: string) => selectChild(child)}
        keyExtractor={item => item.id}
        renderItem={(item: IChild) => item.lastName + " " + item.firstName}
      />
    );

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
