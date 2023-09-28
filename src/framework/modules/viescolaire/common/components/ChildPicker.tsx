import React from 'react';
import { ViewStyle } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import UserList from '~/framework/components/UserList';
import { UserChildrenFlattened, getFlattenedChildren } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { loadStoredChildAction, selectChildAction } from '~/framework/modules/viescolaire/dashboard/actions';
import dashboardConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { handleAction, tryAction } from '~/framework/util/redux/actions';

interface ChildPickerDispatchProps {
  handleSelectChild: (childId: string, userId?: string) => void;
  tryLoadStoredChild: () => Promise<string | undefined>;
}

interface ChildPickerProps extends ChildPickerDispatchProps {
  initialSelectedChildId: string;
  userChildren: UserChildrenFlattened;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  userId?: string;
}

const ChildPicker = (props: ChildPickerProps) => {
  const [selectedChildId, setSelectedChildId] = React.useState(props.initialSelectedChildId);

  React.useEffect(() => {
    props.tryLoadStoredChild();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const { initialSelectedChildId, userId } = props;
    if (selectedChildId && selectedChildId !== initialSelectedChildId) props.handleSelectChild(selectedChildId, userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId]);

  React.useEffect(() => {
    if (props.initialSelectedChildId !== selectedChildId) setSelectedChildId(props.initialSelectedChildId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.initialSelectedChildId]);

  return props.userChildren.length > 1 ? (
    <UserList
      horizontal
      data={props.userChildren.map(child => ({ id: child.id, name: child.firstName }))}
      selectedId={selectedChildId}
      onSelect={setSelectedChildId}
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
      initialSelectedChildId: dashboardState.selectedChildId,
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
      dispatch,
    ),
)(ChildPicker);
