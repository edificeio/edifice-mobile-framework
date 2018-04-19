import conversationHandle from './conversation/NotifHandler';
import timelineHandle from './timeline/NotifHandler';

export default dispatch => data => {
    conversationHandle(dispatch)(data);
    timelineHandle(dispatch)(data);
}