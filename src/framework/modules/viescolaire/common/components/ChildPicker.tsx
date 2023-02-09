import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { UserChild, UserChildrenFlattened, getFlattenedChildren } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { selectChildAction } from '~/framework/modules/viescolaire/dashboard/actions/children';
import viescoConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { tryAction } from '~/framework/util/redux/actions';
import Dropdown from '~/ui/Dropdown';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingTop: UI_SIZES.spacing.small,
    paddingBottom: UI_SIZES.spacing.medium,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    backgroundColor: theme.palette.grey.white,
    zIndex: 100,
  },
  shadow: {
    elevation: 20,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
});

interface IChildPickerProps {
  children?: React.ReactNode;
  selectedChildId?: string;
  userChildren?: UserChildrenFlattened;
  selectChild: (childId: string) => void;
}

const ChildPicker = ({ children, selectedChildId, userChildren, selectChild }: IChildPickerProps) => {
  const [value, setValue] = React.useState(selectedChildId);

  return userChildren ? (
    <View style={[styles.container, styles.shadow]}>
      <Dropdown
        data={userChildren}
        value={value}
        onSelect={(id: string) => {
          setValue(id);
          if (id !== selectedChildId) {
            selectChild(id);
          }
        }}
        title={I18n.t('viesco-pickChild')}
        keyExtractor={(item: UserChild) => item.id}
        renderItem={(item: UserChild) => `${item.firstName} ${item.lastName}`}
      />
      {children}
    </View>
  ) : null;
};

export default connect(
  (state: IGlobalState) => () => {
    const session = getSession(state);
    const viescoState = viescoConfig.getState(state);

    return {
      selectedChildId: viescoState.children.selectedChild,
      userChildren: getFlattenedChildren(session?.user.children),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        selectChild: tryAction(selectChildAction, undefined, true),
      },
      dispatch,
    ),
)(ChildPicker);
