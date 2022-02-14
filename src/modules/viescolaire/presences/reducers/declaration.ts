import { IDeclarationState, stateDefault, declarationActionsTypes } from '~/modules/viescolaire/presences/state/declaration';

const reducer: (state: IDeclarationState, action: { type: string; errmsg: string }) => IDeclarationState = (
  state = stateDefault,
  action,
) => {
  switch (action.type) {
    case declarationActionsTypes.error:
      return {
        isPosting: false,
        errmsg: action.errmsg,
      };
    case declarationActionsTypes.isPosting:
      return {
        isPosting: true,
        errmsg: '',
      };
    case declarationActionsTypes.posted:
      return stateDefault;
    default:
      return state;
  }
};

export default reducer;
