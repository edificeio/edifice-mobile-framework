import { read } from "../../infra/Cache";
import { navigate } from "../../utils/navHelper";

export const readCurrentUser = dispatch => async () => {
    const userinfo = await read('/userbook/api/person');
    
    dispatch({
        type: "LOGIN_AUTH",
        loggedIn: true,
		userbook: userinfo.result["0"]
    })

    console.log('Navigating to main');
	navigate("Main");
}