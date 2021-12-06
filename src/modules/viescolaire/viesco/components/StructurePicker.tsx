import * as React from 'react';
import { View, StyleSheet } from 'react-native';

import Dropdown from '~/ui/Dropdown';
import { IStructureArray, IStructure } from '~/modules/viescolaire/viesco/state/structure';

const styles = StyleSheet.create({
  container: {
    zIndex: 20,
    marginTop: 10,
    paddingBottom: 10,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

export default class StructurePicker extends React.PureComponent<{
  selectedStructure: string;
  structures: IStructureArray;
  selectStructure: (t: string) => void;
}> {
  public render() {
    const { selectedStructure, structures, selectStructure } = this.props;

    return (
      <View style={styles.container}>
        <Dropdown
          data={Object.entries(structures).map(([structureId, structureValue]) => ({
            id: structureId,
            ...structureValue,
          }))}
          value={selectedStructure}
          onSelect={(structure: string) => selectStructure(structure)}
          keyExtractor={item => item.id}
          renderItem={(item: IStructure) => item.name}
        />
      </View>
    );
  }
}
