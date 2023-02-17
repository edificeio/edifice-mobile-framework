import moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import {
  IChildArray,
  getChildrenList,
  getSelectedChild,
  getSelectedChildStructure,
} from '~/framework/modules/viescolaire/dashboard/state/children';
import { NotificationRelativesModal } from '~/framework/modules/viescolaire/presences/components/NotificationRelativesModal';
import { fetchChildrenEventsAction } from '~/modules/viescolaire/presences/actions/relativesNotificationModal';
import {
  IChildEventsNotificationState,
  getRelativesNotification,
} from '~/modules/viescolaire/presences/state/relativesNotificationModal';

type NotificationRelativesModalProps = {
  childId: string;
  childrenArray: IChildArray;
  childrenEvents: IChildEventsNotificationState;
  isCheckOpenModalDone: boolean;
  isClosingNoEvents: boolean;
  showModal: boolean;
  structureId: string;
  getChildrenEvents: (childrenArray: IChildArray, structureId: string, startDate: moment.Moment, endDate: moment.Moment) => void;
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
    const { childrenArray, structureId } = this.props;

    this.props.getChildrenEvents(childrenArray, structureId, moment(), moment());
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
        childrenArray={this.props.childrenArray}
      />
    ) : null;
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps = (state: IGlobalState) => {
  const childId = getSelectedChild(state)?.id;
  const childrenArray = getChildrenList(state);
  const childrenEvents = getRelativesNotification(state);
  const structureId = getSelectedChildStructure(state)?.id;
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
  childrenArray?.map(child => {
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
    childrenArray,
    childId,
    childrenEvents,
    isCheckOpenModalDone,
    isClosingNoEvents,
    structureId,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      getChildrenEvents: fetchChildrenEventsAction,
    },
    dispatch,
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationRelativesModalContainer);
