import React from 'react';
import { StyleSheet, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { getSession } from '~/framework/modules/auth/reducer';
import { loadStoredStructureAction, selectStructureAction } from '~/framework/modules/viescolaire/dashboard/actions';
import dashboardConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { handleAction, tryAction } from '~/framework/util/redux/actions';

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

interface IStructurePickerDispatchProps {
  handleSelectStructure: (id: string, userId?: string) => void;
  tryLoadStoredStructure: () => Promise<string | undefined>;
}

type IStructurePickerProps = {
  selectedStructureId: string;
  structures: { label: string; value: string }[];
  userId?: string;
} & IStructurePickerDispatchProps;

const StructurePicker = (props: IStructurePickerProps) => {
  const [isOpen, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(props.selectedStructureId);

  React.useEffect(() => {
    props.tryLoadStoredStructure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const { selectedStructureId, userId } = props;
    if (value && value !== selectedStructureId) props.handleSelectStructure(value, userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  React.useEffect(() => {
    if (props.selectedStructureId !== value) setValue(props.selectedStructureId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedStructureId]);

  return value && props.structures.length > 1 ? (
    <View style={styles.container}>
      <DropDownPicker
        open={isOpen}
        value={value}
        items={props.structures}
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
    const dashboardState = dashboardConfig.getState(state);
    const session = getSession();

    return {
      selectedStructureId: dashboardState.selectedStructureId,
      structures:
        session?.user.structures?.map(structure => ({
          label: structure.name,
          value: structure.id,
        })) ?? [],
      userId: session?.user.id,
    };
  },
  dispatch =>
    bindActionCreators<IStructurePickerDispatchProps>(
      {
        handleSelectStructure: handleAction(selectStructureAction),
        tryLoadStoredStructure: tryAction(loadStoredStructureAction),
      },
      dispatch,
    ),
)(StructurePicker);
