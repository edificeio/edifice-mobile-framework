import userConfig from "../../../user/config";
import viescoConfig from "../../config";
import { getSessionInfo } from "../../../App";

// THE MODEL --------------------------------------------------------------------------------------

export interface IChild {
  firstName: string;
  lastName: string;
}

export type IChildArray = {
  [id: string]: IChild;
};

// THE STATE --------------------------------------------------------------------------------------

export type IChildState = {
  selectedChild: string | null;
};

export const initialState: IChildState = {
  selectedChild: null,
};

export const getSelectedChild = (globalState: any) =>
  viescoConfig.getLocalState(globalState).viesco.children.selectedChild;

export const getChildrenList = (globalState: any) => userConfig.getLocalState(globalState).info.children;

export const getSelectedChildStructure = (globalState: any) => {
  const infos = getSessionInfo();
  return infos.schools?.find(
    school =>
      infos.childrenStructure?.find(school => school.children.some(child => child.id === getSelectedChild(globalState)))
        ?.structureName == school.name
  );
};

// THE ACTION TYPES -------------------------------------------------------------------------------

export const selectChildActionType = viescoConfig.createActionType("SELECTCHILD");
