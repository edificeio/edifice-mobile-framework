import { INotificationList } from "../state/notificationList";
import moment from "moment";
import { removeAccents } from "../../utils/string";
import { fetchJSONWithCache } from "../../infra/fetchWithCache";

// Data type of what is given by the backend.
export type INotificationListBackend = {
  number: string;
  results: Array<{
    date: {
      $date: number;
    };
    "event-type": string;
    message: string;
    params: {
      uri?: string;
      profilUri?: string;
      username?: string;
      resourceName?: string;
    };
    recipients: Array<{
      unread: number;
      userId: string;
    }>;
    resource: string;
    sender: string;
    type: string;
    _id: string;
  }>;
  status: string;
}

const notificationListAdapter: (
  data: INotificationListBackend
) => INotificationList = data => {
  let result = [] as INotificationList;
  if (!data) return result;
  result = data.results.map(item => ({
    id: item._id,
    date: moment(item.date.$date),
    eventType: item["event-type"],
    message: item.message,
    params: item.params,
    recipients: item.recipients,
    resource: item.resource,
    sender: item.sender,
    type: item.type
  }))
  return result;
};

export const notificationListService = {
  get: async (apps: string[]) => {
    const appParams = apps.map((app: string) => {
      `&type=${removeAccents(app.replace(/\s/g, "").toUpperCase())}`
    })
      .join("");
    const data = notificationListAdapter(
      await fetchJSONWithCache(`/timeline/lastNotifications?page=0${appParams}`)
    );
    return data;
  }
}
