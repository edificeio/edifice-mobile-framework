import React from 'react';
import { StyleSheet, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { getFlattenedChildren } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { loadStoredChildAction, selectChildAction } from '~/framework/modules/viescolaire/dashboard/actions';
import dashboardConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { handleAction, tryAction } from '~/framework/util/redux/actions';
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

interface IChildPickerDispatchProps {
  handleSelectChild: (childId: string, userId?: string) => void;
  tryLoadStoredChild: () => Promise<string | undefined>;
}

type IChildPickerProps = {
  selectedChildId: string;
  userChildren: { label: string; value: string; icon: () => React.JSX.Element }[];
  children?: React.ReactNode;
  userId?: string;
} & IChildPickerDispatchProps;

const ChildPicker = (props: IChildPickerProps) => {
  const [isOpen, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(props.selectedChildId);

  React.useEffect(() => {
    props.tryLoadStoredChild();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const { selectedChildId, userId } = props;
    if (value && value !== selectedChildId) props.handleSelectChild(value, userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  React.useEffect(() => {
    if (props.selectedChildId !== value) setValue(props.selectedChildId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedChildId]);

  return value ? (
    <View style={styles.container}>
      <DropDownPicker
        open={isOpen}
        value={value}
        items={props.userChildren}
        setOpen={setOpen}
        setValue={setValue}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdown}
        textStyle={styles.dropdownText}
        containerStyle={UI_STYLES.flex1}
      />
      {props.children}
    </View>
  ) : null;
};

export default connect(
  (state: IGlobalState) => {
    const dashboardState = dashboardConfig.getState(state);
    const session = getSession();

    return {
      selectedChildId: dashboardState.selectedChildId,
      userChildren:
        getFlattenedChildren(session?.user.children)
          ?.filter(child => child.classesNames.length > 0)
          .map(child => ({
            label: `${child.firstName} ${child.lastName}`,
            value: child.id,
            icon: () => <SingleAvatar userId={child.id} size={24} />,
          })) ?? [],
      userId: session?.user.id,
    };
  },
  dispatch =>
    bindActionCreators<IChildPickerDispatchProps>(
      {
        handleSelectChild: handleAction(selectChildAction),
        tryLoadStoredChild: tryAction(loadStoredChildAction),
      },
      dispatch,
    ),
)(ChildPicker);
