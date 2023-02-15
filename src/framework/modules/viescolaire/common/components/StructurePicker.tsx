import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { UI_SIZES } from '~/framework/components/constants';
import { StructureNode } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { selectStructureAction } from '~/framework/modules/viescolaire/dashboard/actions/structure';
import viescoConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { tryAction } from '~/framework/util/redux/actions';
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

interface IStructurePickerProps {
  selectedStructureId: string;
  structures?: StructureNode[];
  selectStructure: (id: string) => void;
}

const StructurePicker = ({ selectedStructureId, structures, selectStructure }: IStructurePickerProps) => {
  const [value, setValue] = React.useState(selectedStructureId);

  return structures && structures.length > 1 ? (
    <View style={styles.container}>
      <Dropdown
        data={structures}
        value={value}
        onSelect={(id: string) => {
          setValue(id);
          selectStructure(id);
        }}
        keyExtractor={(item: StructureNode) => item.id}
        renderItem={(item: StructureNode) => item.name}
      />
    </View>
  ) : null;
};

export default connect(
  (state: IGlobalState) => {
    const session = getSession(state);
    const viescoState = viescoConfig.getState(state);

    return {
      selectedStructureId: viescoState.structure.selectedStructure,
      structures: session?.user.structures,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        selectStructure: tryAction(selectStructureAction, undefined, true),
      },
      dispatch,
    ),
)(StructurePicker);
