import viescoConfig from '~/modules/viescolaire/dashboard/moduleConfig';
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
  const selectedChildId = viescoConfig.getState(globalState).children.selectedChild;
  const selectedChild = userConfig.getLocalState(globalState).info.children[selectedChildId];
  return { id: selectedChildId, ...selectedChild };
};

export const getChildrenList = (globalState: any): IChildArray => {
  const children = userConfig.getLocalState(globalState).info.children;
  const ret = [] as IChildArray;
  for (const childId in children) {
    const childValue = children[childId];
    ret.push({
      id: childId,
      ...(childValue as object),
    } as IChild);
  }
  return ret;
};

export const getSelectedChildStructure = (globalState: any) => {
  return globalState.user.info.schools?.find(
    school =>
      globalState.user.info.childrenStructure?.find(elem =>
        elem.children.some(child => child.id === getSelectedChild(globalState).id),
      )?.structureName === school.name,
  );
};

// THE ACTION TYPES -------------------------------------------------------------------------------

export const selectChildActionType = viescoConfig.namespaceActionType('SELECTCHILD');
