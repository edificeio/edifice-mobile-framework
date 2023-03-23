import React from 'react';
import { StyleSheet, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { getSession } from '~/framework/modules/auth/reducer';
import { selectStructureAction } from '~/framework/modules/viescolaire/dashboard/actions/structure';
import viescoConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { tryAction } from '~/framework/util/redux/actions';

const styles = StyleSheet.create({
  container: {
    padding: UI_SIZES.spacing.small,
    backgroundColor: theme.ui.background.card,
    borderBottomRightRadius: UI_SIZES.radius.large,
    borderBottomLeftRadius: UI_SIZES.radius.large,
    zIndex: 100,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 1,
  },
  dropdown: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
  },
  dropdownText: {
    color: theme.ui.text.regular,
  },
});

interface IStructurePickerProps {
  selectedStructureId?: string;
  structures?: { label: string; value: string }[];
  selectStructure: (id: string) => void;
}

const StructurePicker = ({ selectedStructureId, structures = [], selectStructure }: IStructurePickerProps) => {
  const [isOpen, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(selectedStructureId);

  React.useEffect(() => {
    if (value && value !== selectedStructureId) selectStructure(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return value && structures.length > 1 ? (
    <View style={styles.container}>
      <DropDownPicker
        open={isOpen}
        value={value}
        items={structures}
        setOpen={setOpen}
        setValue={setValue}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdown}
        textStyle={styles.dropdownText}
      />
    </View>
  ) : null;
};

export default connect(
  (state: IGlobalState) => {
    const viescoState = viescoConfig.getState(state);
    const session = getSession();

    return {
      selectedStructureId: viescoState.structure.selectedStructure,
      structures: session?.user.structures?.map(structure => ({
        label: structure.name,
        value: structure.id,
      })),
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
