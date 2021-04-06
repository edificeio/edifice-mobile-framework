import { IUserSession } from "./session";

export const resourceRightFilter = (
  resources: Array<{
    shared?: Array<{ userId?: string; groupId?: string; [key: string]: boolean | string | undefined }>;
    author: { userId: string; username: string; login: string; };
  }>,
  key: string,
  session: IUserSession
) => {
  return resources.filter(resource => resourceHasRight(resource, key, session));
}

export const resourceHasRight = (
  resource: {
    shared?: Array<{ userId?: string; groupId?: string;[key: string]: boolean | string | undefined }>;
    author: { userId: string; username: string; login: string; };
  },
  key: string,
  session: IUserSession
) => {
  if (resource.author.userId === session.user.id) return true;
  let hasRight = false;
  resource.shared?.forEach(sharedEntry => {
    if (hasRight) return;
    const { userId, groupId, ...rights } = sharedEntry;
    if (userId === session.user.id || (groupId && session.user.groupsIds && session.user.groupsIds?.includes(groupId))) {
      for (const k of Object.keys(rights)) {
        if (k === key && rights[k] === true) hasRight = true;
      }
    }
  })
  return hasRight;
}
