import { getSessionInfo } from '~/App';
import viescoConfig from '~/modules/viescolaire/moduleConfig';
import userConfig from '~/user/config';

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

export const getSelectedChild = (globalState: any) => {
  const selectedChildId = viescoConfig.getState(globalState).viesco.children.selectedChild;
  const selectedChild = userConfig.getLocalState(globalState).info.children[selectedChildId];
  return { id: selectedChildId, ...selectedChild };
};

export const getChildrenList = (globalState: any): IChildArray => {
  const children = userConfig.getLocalState(globalState).info.children;
  return Object.entries(children).map(
    ([childId, childValue]) =>
      ({
        id: childId,
        ...(childValue as object),
      } as IChild),
  );
};

export const getSelectedChildStructure = (globalState: any) => {
  const infos = getSessionInfo();
  return infos.schools?.find(
    school =>
      infos.childrenStructure?.find(school => school.children.some(child => child.id === getSelectedChild(globalState).id))
        ?.structureName === school.name,
  );
};

// THE ACTION TYPES -------------------------------------------------------------------------------

export const selectChildActionType = viescoConfig.namespaceActionType('SELECTCHILD');
