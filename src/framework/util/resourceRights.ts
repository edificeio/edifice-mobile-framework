import { AuthActiveAccount, AuthLoggedAccount } from '~/framework/modules/auth/model';

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

/**
 * Get new-generations rights from string array.
 * @param data
 * @param session
 * @returns
 */
export const computeRights = (data: { rights: string[] }, session: AuthActiveAccount) => {
  const rights: Set<string> = new Set();
  for (const rightStr of data.rights) {
    const right = rightStr.split(':'); // 0: target, 1: id, 2: right if not creator
    switch (right[0]) {
      case 'creator':
        if (right[1] === session.user.id) rights.add(right[0]);
        break;
      case 'user':
        if (right[1] === session.user.id) rights.add(right[2]);
        break;
      case 'group':
        if (session.user.groups.includes(right[1])) rights.add(right[2]);
        break;
    }
  }
  return [...rights];
};
