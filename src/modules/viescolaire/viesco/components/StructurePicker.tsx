import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { IStructure, IStructureArray } from '~/modules/viescolaire/viesco/state/structure';
import Dropdown from '~/ui/Dropdown';

const styles = StyleSheet.create({
  container: {
    zIndex: 20,
    marginTop: 10, // MO-142 use UI_SIZES.spacing here
    paddingBottom: 10, // MO-142 use UI_SIZES.spacing here
    marginHorizontal: 20, // MO-142 use UI_SIZES.spacing here
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
