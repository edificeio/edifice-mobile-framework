import { Dispatch } from 'redux';

import { IGlobalState } from '~/app/store';
import { assertSession } from '~/framework/modules/auth/reducer';
import { IDistantFile } from '~/framework/util/fileHandler';
import fileHandlerService from '~/framework/util/fileHandler/service';

export function downloadAttachmentAction(att: IDistantFile) {
  return async (dispatch: Dispatch, getState: () => IGlobalState) => {
    try {
      const session = assertSession();
      (await fileHandlerService.downloadFile(session, att, {})).open();
    } catch {
      // TODO: Manage error
    }
  };
}
