import { read } from "../../infra/Cache";
import { Me } from "../../infra/Me";
import { fetchJSONWithCache } from "../../infra/fetchWithCache";

let dataFilled = false;
export const fillUserData = async () => {
  if (dataFilled) {
    return;
  }
  const data = await fetchJSONWithCache(`/directory/user/${Me.session.userId}`);
  for (let prop in data) {
    Me.session[prop] = data[prop];
  }
  dataFilled = true;
};
