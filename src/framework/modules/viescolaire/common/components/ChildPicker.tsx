import React from 'react';
import { ViewStyle } from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import UserList from '~/framework/components/UserList';
import { getFlattenedChildren, UserChildrenFlattened } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { loadStoredChildAction, selectChildAction } from '~/framework/modules/viescolaire/dashboard/actions';
import dashboardConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { handleAction, tryAction } from '~/framework/util/redux/actions';

interface ChildPickerDispatchProps {
  handleSelectChild: (childId: string, userId?: string) => void;
  tryLoadStoredChild: () => Promise<string | undefined>;
}

interface ChildPickerProps extends ChildPickerDispatchProps {
  selectedChildId: string;
  userChildren: UserChildrenFlattened;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  userId?: string;
}

const ChildPicker = (props: ChildPickerProps) => {
  React.useEffect(() => {
    props.tryLoadStoredChild();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectChild = (id: string) => props.handleSelectChild(id, props.userId);

  return props.userChildren.length > 1 ? (
    <UserList
      horizontal
      data={props.userChildren.map(child => ({ id: child.id, name: child.firstName }))}
      selectedId={props.selectedChildId}
      onSelect={selectChild}
      style={props.style}
      contentContainerStyle={props.contentContainerStyle}
    />
  ) : null;
};

export default connect(
  (state: IGlobalState) => {
    const dashboardState = dashboardConfig.getState(state);
    const session = getSession();

    return {
      selectedChildId: dashboardState.selectedChildId,
      userChildren: getFlattenedChildren(session?.user.children)?.filter(c => c.classesNames.length > 0) ?? [],
      userId: session?.user.id,
    };
  },
  dispatch =>
    bindActionCreators<ChildPickerDispatchProps>(
      {
        handleSelectChild: handleAction(selectChildAction),
        tryLoadStoredChild: tryAction(loadStoredChildAction),
      },
      dispatch
    )
)(ChildPicker);
