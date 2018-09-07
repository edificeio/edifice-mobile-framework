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
      // tslint:disable-next-line:no-console
      credentials ? await getToken(credentials) : await loadToken();
      console.log(oauth.isExpired());
      // tslint:disable-next-line:no-console
      dispatch({ type: "LOGGED" });
    } catch (errmsg) {
      // dispatch(homeworkDiaryListFetchError(errmsg));
      // tslint:disable-next-line:no-console
      console.warn("login failed.");
      navigate("Login", { email: "" });
    }
  };
}

/**
 * Force get a fresh new token with given credentials.
 * @param credentials
 */
export async function getToken(credentials: {
  username: string;
  password: string;
}) {
  try {
    // tslint:disable-next-line:no-console
    console.log("get new token with: ", credentials);
    await oauth.getToken(credentials.username, credentials.password);
    // tslint:disable-next-line:no-console
    console.log(oauth);
  } catch (errmsg) {
    // dispatch(homeworkDiaryListFetchError(errmsg));
    // tslint:disable-next-line:no-console
    console.warn("get tokens failed.", errmsg);
    throw errmsg;
  }
}

/**
 * Read stored token in local storage.
 */
export async function loadToken() {
  try {
    // tslint:disable-next-line:no-console
    console.log("load saved token");
    throw new Error("not implemented");
  } catch (errmsg) {
    // dispatch(homeworkDiaryListFetchError(errmsg));
    // tslint:disable-next-line:no-console
    console.warn("load token failed.");
    throw errmsg;
  }
}
