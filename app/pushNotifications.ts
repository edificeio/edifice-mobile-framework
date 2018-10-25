import conversationHandle from "./conversation/NotifHandler";
// TODO: integrate notification handler in module config
import mailboxHandle from "./mailbox/notifHandler";
import timelineHandle from "./timeline/NotifHandler";

export default dispatch => data => {
  // conversationHandle(dispatch)(data);
  mailboxHandle(dispatch)(data);
  timelineHandle(dispatch)(data);
};
