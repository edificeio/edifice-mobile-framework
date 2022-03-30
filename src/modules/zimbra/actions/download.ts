import { Dispatch } from 'redux';

import { IGlobalState } from '~/AppStore';
import { IDistantFile } from '~/framework/util/fileHandler';
import fileHandlerService from '~/framework/util/fileHandler/service';
import { getUserSession } from '~/framework/util/session';

export function downloadAttachmentAction(att: IDistantFile) {
  return async (dispatch: Dispatch, getState: () => IGlobalState) => {
    try {
      const session = getUserSession(getState());
      (await fileHandlerService.downloadFile(session, att, {})).open();
    } catch (errmsg) {
      // TODO: Manage error
    }
  };
}
