import viescoConfig from "../../config";

export type IEvent = {
  id?: number;
  start_date?: string;
  end_date?: string;
  comment?: string;
  counsellor_input?: string;
  student_id: string;
  register_id: number;
  type_id: number;
  reason_id?: number;
};

const prefix = viescoConfig.createActionType("CALL_EVENT");

export const eventsActionsTypes = {
  post: prefix + "_POST",
  put: prefix + "_PUT",
  delete: prefix + "_DELETE",
  error: prefix + "_ERROR",
};
