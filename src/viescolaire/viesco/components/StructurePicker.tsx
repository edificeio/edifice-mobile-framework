import * as React from "react";
import { View, StyleSheet } from "react-native";

import Dropdown from "../../../ui/Dropdown";
import { IStructureArray, IStructure } from "../state/structure";

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingBottom: 10,
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
});

export default class StructurePicker extends React.PureComponent<{
  selectedStructure: string;
  structures: IStructureArray;
  selectStructure: (t: string) => void;
}> {
  public render() {
    const { selectedStructure, structures, selectStructure } = this.props;

    const keyExtractor = structure => Object.values(structures).find(item => item.id === structure.id).id;

    return (
      <View style={styles.container}>
        <Dropdown
          data={Object.values(structures)}
          value={selectedStructure}
          onSelect={(structure: string) => selectStructure(structure)}
          keyExtractor={item => keyExtractor(item)}
          renderItem={(item: IStructure) => item.name}
        />
      </View>
    );
  }
}
