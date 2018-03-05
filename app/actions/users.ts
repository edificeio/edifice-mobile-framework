import { PATH_USER } from "../constants/paths"
import { readId } from "./docs"
import { read } from "../infra/Cache";
import { navigate } from "../utils/navHelper";

export const readUserFromId = (id: string) => readId(PATH_USER, id)

export const readCurrentUser = dispatch => async () => {
    const userinfo = await read('/userbook/api/person');
	dispatch({
		type: "USERBOOK_AUTH",
		userbook: userinfo.result["0"]
    });
    
    dispatch({
        type: "LOGIN_AUTH",
        loggedIn: true
    })

    console.log('Navigating to main');
	navigate("Main");
}