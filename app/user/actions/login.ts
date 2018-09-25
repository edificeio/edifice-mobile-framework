import oauth, {
  eraseToken,
  getToken,
  loadToken,
  saveToken
} from "../../infra/oauth";
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
        await getToken(credentials);
        await saveToken(oauth.token);
      } else {
        await loadToken();
      }
      dispatch({ type: "USER_LOGGED_IN" });
      navigate("Main");
    } catch (errmsg) {
      // dispatch(homeworkDiaryListFetchError(errmsg));
      // tslint:disable-next-line:no-console
      console.warn("login failed.");
      navigate("Login", { email: "" });
    }
  };
}

export function logout() {
  return async (dispatch, getState) => {
    try {
      oauth.unsetToken();
      await eraseToken();
      dispatch({ type: "USER_LOGGED_OUT" });
      navigate("Login"); // TODO : place the user e-mail here
    } catch (errmsg) {
      // dispatch(homeworkDiaryListFetchError(errmsg));
      // tslint:disable-next-line:no-console
      console.warn("login failed.");
      navigate("Login", { email: "" });
    }
  };
}
