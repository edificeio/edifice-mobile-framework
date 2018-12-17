// import conversationHandle from "./conversation/NotifHandler";
// TODO: integrate notification handler in module config
import mailboxHandle from "./mailbox/notifHandler";
import timelineHandle from "./timeline/NotifHandler";

export default dispatch => (data, apps) => {
  mailboxHandle(dispatch)(data);
  timelineHandle(dispatch)(data, apps);
};
