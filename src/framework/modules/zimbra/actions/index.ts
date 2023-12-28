import { ThunkAction } from 'redux-thunk';

import { assertSession } from '~/framework/modules/auth/reducer';
import { IFolder, IMail, IQuota, ISignature } from '~/framework/modules/zimbra/model';
import { actionTypes } from '~/framework/modules/zimbra/reducer';
import { zimbraService } from '~/framework/modules/zimbra/service';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

/**
 * Fetch mails from specific folder.
 */
export const zimbraMailListActionsCreators = createAsyncActionCreators(actionTypes.mailList);
export const fetchZimbraMailsFromFolderAction =
  (folder: string, page: number, search?: string): ThunkAction<Promise<Omit<IMail, 'body'>[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(zimbraMailListActionsCreators.request());
      const mails = await zimbraService.mails.listFromFolder(session, folder, page, search);
      dispatch(zimbraMailListActionsCreators.receipt(mails));
      return mails;
    } catch (e) {
      dispatch(zimbraMailListActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch mail with specified identifier.
 */
export const zimbraMailActionsCreators = createAsyncActionCreators(actionTypes.mail);
export const fetchZimbraMailAction =
  (id: string): ThunkAction<Promise<IMail>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(zimbraMailActionsCreators.request());
      const mail = await zimbraService.mail.get(session, id);
      dispatch(zimbraMailActionsCreators.receipt(mail));
      return mail;
    } catch (e) {
      dispatch(zimbraMailActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch quota.
 */
export const zimbraQuotaActionsCreators = createAsyncActionCreators(actionTypes.quota);
export const fetchZimbraQuotaAction = (): ThunkAction<Promise<IQuota>, any, any, any> => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(zimbraQuotaActionsCreators.request());
    const quota = await zimbraService.quota.get(session);
    dispatch(zimbraQuotaActionsCreators.receipt(quota));
    return quota;
  } catch (e) {
    dispatch(zimbraQuotaActionsCreators.error(e as Error));
    throw e;
  }
};

/**
 * Fetch root folders.
 */
export const zimbraRootFoldersActionsCreators = createAsyncActionCreators(actionTypes.rootFolders);
export const fetchZimbraRootFoldersAction = (): ThunkAction<Promise<IFolder[]>, any, any, any> => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(zimbraRootFoldersActionsCreators.request());
    const rootFolders = await zimbraService.rootFolders.get(session);
    dispatch(zimbraRootFoldersActionsCreators.receipt(rootFolders));
    return rootFolders;
  } catch (e) {
    dispatch(zimbraRootFoldersActionsCreators.error(e as Error));
    throw e;
  }
};

/**
 * Fetch signature.
 */
export const zimbraSignatureActionsCreators = createAsyncActionCreators(actionTypes.signature);
export const fetchZimbraSignatureAction = (): ThunkAction<Promise<ISignature>, any, any, any> => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(zimbraSignatureActionsCreators.request());
    const signature = await zimbraService.signature.get(session);
    dispatch(zimbraSignatureActionsCreators.receipt(signature));
    return signature;
  } catch (e) {
    dispatch(zimbraSignatureActionsCreators.error(e as Error));
    throw e;
  }
};
