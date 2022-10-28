import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { IStructure } from '~/modules/viescolaire/dashboard/state/structure';
import Dropdown from '~/ui/Dropdown';

const styles = StyleSheet.create({
  container: {
    zIndex: 20,
    marginTop: UI_SIZES.spacing.small,
    marginHorizontal: UI_SIZES.spacing.medium,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

export default class StructurePicker extends React.PureComponent<{
  selectedStructure: string;
  structures: IStructure[];
  selectStructure: (t: string) => void;
}> {
  public render() {
    const { selectedStructure, structures, selectStructure } = this.props;
    return structures.length > 1 ? (
      <View style={styles.container}>
        <Dropdown
          data={structures}
          value={selectedStructure}
          onSelect={(structure: string) => selectStructure(structure)}
          keyExtractor={item => item.id}
          renderItem={(item: IStructure) => item.name}
        />
      </View>
    ) : null;
  }
}
