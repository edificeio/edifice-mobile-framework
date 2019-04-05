// import conversationHandle from "./conversation/NotifHandler";
// TODO: integrate notification handler in module config
import homeworksHandle from "./homework/notifHandler";
import mailboxHandle from "./mailbox/notifHandler";
import timelineHandle from "./timeline/NotifHandler";

export default dispatch => (data, apps) => {
  // console.log("handle notif data:", data);
  mailboxHandle(dispatch)(data);
  timelineHandle(dispatch)(data, apps);
  homeworksHandle(dispatch)(data);
};
