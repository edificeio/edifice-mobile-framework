import { AuthLoggedAccount } from '~/framework/modules/auth/model';

export interface IResource {
  shared?: { userId?: string; groupId?: string; [key: string]: boolean | string | undefined }[];
  author?: { userId: string; username?: string; login?: string };
  owner?: { userId: string; displayName?: string };
}

export const resourceHasRight = (resource: IResource, key: string, session: AuthLoggedAccount) => {
  if (resource.author?.userId === session.user.id || resource.owner?.userId === session.user.id) return true;
  let hasRight = false;
  resource.shared?.forEach(sharedEntry => {
    if (hasRight) return;
    const { groupId, userId, ...rights } = sharedEntry;
    if (userId === session.user.id || (groupId && session.user.groups && session.user.groups?.includes(groupId))) {
      for (const k of Object.keys(rights)) {
        if (k === key && rights[k] === true) hasRight = true;
      }
    }
  });
  return hasRight;
};

export const resourceRightFilter = (
  resources: {
    shared?: { userId?: string; groupId?: string; [key: string]: boolean | string | undefined }[];
    author: { userId: string; username: string; login: string };
  }[],
  key: string,
  session: AuthLoggedAccount,
) => {
  return resources.filter(resource => resourceHasRight(resource, key, session));
};
