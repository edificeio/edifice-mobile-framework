import React from 'react';
import { StyleSheet, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { getFlattenedChildren } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { selectChildAction } from '~/framework/modules/viescolaire/dashboard/actions/children';
import viescoConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { tryActionLegacy } from '~/framework/util/redux/actions';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
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

interface IChildPickerProps {
  children?: React.ReactNode;
  selectedChildId?: string;
  userChildren?: { label: string; value: string; icon: () => JSX.Element }[];
  selectChild: (childId: string) => void;
}

const ChildPicker = ({ children, selectedChildId, userChildren = [], selectChild }: IChildPickerProps) => {
  const [isOpen, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(selectedChildId);

  React.useEffect(() => {
    if (value && value !== selectedChildId) selectChild(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  React.useEffect(() => {
    if (selectedChildId !== value) setValue(selectedChildId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId]);

  return value ? (
    <View style={styles.container}>
      <DropDownPicker
        open={isOpen}
        value={value}
        items={userChildren}
        setOpen={setOpen}
        setValue={setValue}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdown}
        textStyle={styles.dropdownText}
        containerStyle={UI_STYLES.flex1}
      />
      {children}
    </View>
  ) : null;
};

export default connect(
  (state: IGlobalState) => {
    const viescoState = viescoConfig.getState(state);
    const session = getSession();

    return {
      selectedChildId: viescoState.children.selectedChild,
      userChildren: getFlattenedChildren(session?.user.children)?.map(child => ({
        label: `${child.firstName} ${child.lastName}`,
        value: child.id,
        icon: () => <SingleAvatar userId={child.id} size={24} />,
      })),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        selectChild: tryActionLegacy(selectChildAction, undefined, true),
      },
      dispatch,
    ),
)(ChildPicker);
