import { fetchJSONWithCache } from "../../infra/fetchWithCache";

export type IUser = {
  id: string;
  displayName: string;
  groupDisplayName: string;
  profile: string;
  structureName: string;
};

export type ISearchUsers = IUser[];

export type ISearchUsersGroups = {
  groups: Array<{
    id: string;
    name: string;
    displayName: string;
    profile: string;
    structureName: string;
  }>;
  users: ISearchUsers;
}

const SearchUsersAdapter: (data: ISearchUsersGroups) => ISearchUsersGroups = data => {
  let result = {} as ISearchUsersGroups;
  if (!data) return result;
  result = {
    groups: data.groups,
    users: data.users,
  };
  return result;
};

export const newMailService = {
  getSearchUsers: async search => {
    const data = SearchUsersAdapter(await fetchJSONWithCache(`/zimbra/visible?search=${search}`));
    return data;
  },
  sendMail: async mailDatas => {
    await fetchJSONWithCache(`/zimbra/send`, { method: "POST", body: JSON.stringify(mailDatas) });
  },
  makeDraftMail: async mailDatas => {
    await fetchJSONWithCache(`/zimbra/draft`, { method: "POST", body: JSON.stringify(mailDatas) });
  },
  updateDraftMail: async (mailId, mailDatas) => {
    await fetchJSONWithCache(`/zimbra/draft/${mailId}`, { method: "PUT", body: JSON.stringify(mailDatas) });
  },
};
