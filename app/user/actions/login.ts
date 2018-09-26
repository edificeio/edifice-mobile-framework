import oauth from "../../infra/oauth";
import { navigate } from "../../utils/navHelper";

export enum LoginResult {
  success,
  passwordError,
  connectionError
}

export function login(credentials?: { username: string; password: string }) {
  return async (dispatch, getState) => {
    try {
      if (credentials) {
        await oauth.getToken(credentials.username, credentials.password);
      } else {
        // Here, an offline user will try to load a token.
        // If a token is stored, it allows the user to be offline.
        await oauth.loadToken();
      }
      dispatch({ type: "USER_LOGGED_IN" });
      navigate("Main");
    } catch (errmsg) {
      // tslint:disable-next-line:no-console
      console.warn("login failed.");
      navigate("Login", { email: "" });
    }
  };
}

export function logout() {
  return async (dispatch, getState) => {
    try {
      await oauth.eraseToken();
      dispatch({ type: "USER_LOGGED_OUT" });
      navigate("Login"); // TODO : place the user e-mail here
    } catch (errmsg) {
      // tslint:disable-next-line:no-console
      console.warn("login failed.");
      navigate("Login", { email: "" });
    }
  };
}
