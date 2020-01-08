import { IUserInfoState } from "../user/state/info";

export const resourceRightFilter = (
  resources: Array<{
    shared?: Array<{ userId?: string; groupId?: string; [key: string]: boolean | string | undefined }>;
    author: { userId: string; username: string; login: string; };
  }>,
  key: string,
  userinfo: IUserInfoState
) => {
  return resources.filter(resource => {
    if (resource.author.userId === userinfo.id) return true;
    let hasRight = false;
    resource.shared?.forEach(sharedEntry => {
      if (hasRight) return;
      const { userId, groupId, ...rights } = sharedEntry;
      if (userId === userinfo.id || userinfo.groups?.includes(groupId)) {
        for (const k of Object.keys(rights)) {
          if (k === key && rights[k] === true) hasRight = true;
        }
      }
    })
    return hasRight;
  });
}
