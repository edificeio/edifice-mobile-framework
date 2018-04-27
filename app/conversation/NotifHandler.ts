import { navigate } from "../utils/navHelper";
import { openThread } from "./actions";
import { Conf } from "../Conf";
import { readNextConversation } from './actions/readNextConversation';

export default dispatch => async notificationData => {
    if(!notificationData.resourceUri.startsWith('/conversation')){
        return;
    }
    const split = notificationData.resourceUri.split('/');
    const messageId = split[split.length - 1];
    await readNextConversation(dispatch)(0);
    const response = await fetch(`${ Conf.platform }/conversation/message/${messageId }`)
    const message = await response.json();
    openThread(dispatch)(message.thread_id);
    navigate('thread');
}