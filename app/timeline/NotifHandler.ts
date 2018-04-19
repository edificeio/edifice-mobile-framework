import { navigate } from "../utils/navHelper";
import { Conf } from "../Conf";

export default dispatch => async notificationData => {
    if(!notificationData.resourceUri.startsWith('/blog')){
        return;
    }
}