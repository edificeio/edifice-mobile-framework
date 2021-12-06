import viescoConfig from '~/modules/viescolaire/moduleConfig';

export interface IDeclarationState {
  isPosting: boolean;
  errmsg: string;
}

export const stateDefault: IDeclarationState = {
  isPosting: false,
  errmsg: '',
};

const declarationPrefix = viescoConfig.namespaceActionType('ABSENCE_DECLARATION');

export const declarationActionsTypes = {
  isPosting: declarationPrefix + '_IS_POSTING',
  error: declarationPrefix + '_ERROR',
  posted: declarationPrefix + '_DONE',
};
