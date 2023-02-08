import { ISession } from '~/framework/modules/auth/model';

export interface IResource {
  shared?: { userId?: string; groupId?: string; [key: string]: boolean | string | undefined }[];
  author: { userId: string; username?: string; login?: string };
}

export const resourceHasRight = (resource: IResource, key: string, session: ISession) => {
  if (resource.author.userId === session.user.id) return true;
  let hasRight = false;
  resource.shared?.forEach(sharedEntry => {
    if (hasRight) return;
    const { userId, groupId, ...rights } = sharedEntry;
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
  session: ISession,
) => {
  return resources.filter(resource => resourceHasRight(resource, key, session));
};
