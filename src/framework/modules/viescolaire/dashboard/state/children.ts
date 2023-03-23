import { IGlobalState } from '~/app/store';
import { StructureNode, UserChild, UserChildrenFlattened, getFlattenedChildren } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import viescoConfig from '~/framework/modules/viescolaire/dashboard/module-config';

// THE MODEL --------------------------------------------------------------------------------------

export interface IChild {
  id: string;
  firstName: string;
  lastName: string;
}

export type IChildArray = IChild[];

// THE STATE --------------------------------------------------------------------------------------

export type IChildState = {
  selectedChild: string | null;
};

export const initialState: IChildState = {
  selectedChild: null,
};

export const getSelectedChild = (globalState: IGlobalState): UserChild | undefined => {
  const session = getSession();
  const children = getFlattenedChildren(session?.user.children);
  const selectedChildId = viescoConfig.getState(globalState).children.selectedChild;
  return children?.find(child => child.id === selectedChildId);
};

export const getChildrenList = (globalState: IGlobalState): UserChildrenFlattened => {
  const session = getSession();
  return getFlattenedChildren(session?.user.children) ?? [];
};

export const getSelectedChildStructure = (globalState: IGlobalState): StructureNode | undefined => {
  const session = getSession();
  const children = getFlattenedChildren(session?.user.children);
  const selectedChildId = viescoConfig.getState(globalState).children.selectedChild;
  const structureName = children?.find(child => child.id === selectedChildId)?.structureName;
  return session?.user?.structures?.find(s => s.name === structureName);
};

// THE ACTION TYPES -------------------------------------------------------------------------------

export const selectChildActionType = viescoConfig.namespaceActionType('SELECTCHILD');
