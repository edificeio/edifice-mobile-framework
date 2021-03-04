import { Dispatch } from "redux";

import { Trackers } from "../../infra/tracker";
import { supportService } from "../service/support";

export function createTicketAction() {
  return async (dispatch: Dispatch) => {
    Trackers.trackEvent("Support", "SEND");
    await supportService.createTicket();
  };
}
