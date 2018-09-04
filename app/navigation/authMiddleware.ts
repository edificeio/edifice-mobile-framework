import { navigate } from "../utils/navHelper";
import { Connection } from "../infra/Connection";
import { getLogin } from "../utils/Store";
import { readCurrentUser } from "../auth/actions/readCurrentUser";
import { login } from "../auth/actions/login";

let initAuth = false;

async function auth(dispatch) {
  try {
    const { email = "", password = "" } = await getLogin();

    if (email && password) {
      if (Connection.isOnline) {
        login(dispatch)(email, password);
      } else {
        readCurrentUser(dispatch)();
      }
    } else {
      navigate("Login", { email });
    }
  } catch (e) {
    navigate("Login", { email: "" });
  }
}

export const authMiddleware = store => next => action => {
  try {
    if (action.type === "CHECK_LOGIN_AUTH") {
      auth(store.dispatch);
      initAuth = true;
    }
    if (action.type === "LOGOUT_AUTH") {
      navigate("Login", { email: action.email });
    }

    const returnValue = next(action);

    return returnValue;
  } catch (ex) {
    console.log(ex);
  }
};
