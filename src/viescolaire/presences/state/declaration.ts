import viescoConfig from "../../config";

export interface IDeclarationState {
  isPosting: boolean;
  errmsg: string;
}

export const stateDefault: IDeclarationState = {
  isPosting: false,
  errmsg: "",
};

const declarationPrefix = viescoConfig.createActionType("ABSENCE_DECLARATION");

export const declarationActionsTypes = {
  isPosting: declarationPrefix + "_IS_POSTING",
  error: declarationPrefix + "_ERROR",
  posted: declarationPrefix + "_DONE",
};
