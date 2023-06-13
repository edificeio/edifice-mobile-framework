import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import { UserChildrenFlattened, getFlattenedChildren } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { getChildStructureId } from '~/framework/modules/viescolaire/common/utils/child';
import dashboardConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { fetchPresencesChildrenEventsAction } from '~/framework/modules/viescolaire/presences/actions';
import { NotificationRelativesModal } from '~/framework/modules/viescolaire/presences/components/NotificationRelativesModal';
import { IChildrenEvents } from '~/framework/modules/viescolaire/presences/model';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { AsyncState } from '~/framework/util/redux/async';

type NotificationRelativesModalProps = {
  childId: string;
  children: UserChildrenFlattened;
  childrenEvents: AsyncState<IChildrenEvents | undefined>;
  isCheckOpenModalDone: boolean;
  isClosingNoEvents: boolean;
  showModal: boolean;
  structureId: string;
  fetchChildrenEvents: (structureId: string, studentIds: string[]) => void;
  onClose: () => void;
};

type NotificationRelativesModalState = {
  visible: boolean;
};

class NotificationRelativesModalContainer extends React.PureComponent<
  NotificationRelativesModalProps,
  NotificationRelativesModalState
> {
  constructor(props) {
    super(props);

    this.state = {
      visible: this.props.showModal,
    };
  }

  componentDidMount() {
    const { children, structureId } = this.props;

    this.props.fetchChildrenEvents(
      structureId,
      children.map(child => child.id),
    );
  }

  componentDidUpdate() {
    const { childrenEvents, isClosingNoEvents } = this.props;
    if (childrenEvents?.data && childrenEvents?.data?.studentsEvents && isClosingNoEvents) {
      this.onClose();
    }
  }

  onClose = () => {
    this.setState({
      visible: false,
    });
    this.props.onClose();
  };

  public render() {
    return this.props.isCheckOpenModalDone && !this.props.isClosingNoEvents ? (
      <NotificationRelativesModal
        visible={this.state.visible}
        onClose={this.onClose}
        childrenEvents={this.props.childrenEvents}
        childrenArray={this.props.children}
      />
    ) : null;
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps = (state: IGlobalState) => {
  const presencesState = moduleConfig.getState(state);
  const dashboardState = dashboardConfig.getState(state);
  const session = getSession();
  const children = getFlattenedChildren(session?.user.children);
  const childrenEvents = presencesState.childrenEvents;
  let isClosingNoEvents = false as boolean;
  let isCheckOpenModalDone = false as boolean;

  const checkIsEmptyEvents = (events: any) => {
    if (
      events.DEPARTURE.length <= 0 &&
      events.LATENESS.length <= 0 &&
      events.NO_REASON.length <= 0 &&
      events.UNREGULARIZED.length <= 0 &&
      events.REGULARIZED.length <= 0
    ) {
      return true;
    }
    return false;
  };
  let prevStateIsClosingNoEvents = undefined as undefined | boolean;
  // Close Modal if children don't have any events
  children.map(child => {
    if (childrenEvents && childrenEvents?.data?.studentsEvents && child.id && childrenEvents?.data?.studentsEvents[child.id]) {
      if (checkIsEmptyEvents(childrenEvents?.data?.studentsEvents[child.id].all)) {
        if (prevStateIsClosingNoEvents === undefined) {
          isClosingNoEvents = true;
        }
      } else {
        isClosingNoEvents = false;
        prevStateIsClosingNoEvents = false;
        return;
      }
    }
    isCheckOpenModalDone = true;
  });

  return {
    children,
    childId: dashboardState.selectedChildId,
    childrenEvents,
    isCheckOpenModalDone,
    isClosingNoEvents,
    structureId: getChildStructureId(dashboardState.selectedChildId),
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      fetchChildrenEvents: fetchPresencesChildrenEventsAction,
    },
    dispatch,
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationRelativesModalContainer);
