import { getFlattenedChildren } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';

export const getChildStructureId = (childId?: string): string | undefined => {
  const session = getSession();
  const structureName = getFlattenedChildren(session?.user.children)?.find(child => child.id === childId)?.structureName;
  return session?.user.structures?.find(structure => structure.name === structureName)?.id;
};
