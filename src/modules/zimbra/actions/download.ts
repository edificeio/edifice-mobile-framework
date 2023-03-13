import { NavigationInjectedProps } from 'react-navigation';
import { Dispatch } from 'redux';

import { IGlobalState } from '~/AppStore';
import { IDistantFile } from '~/framework/util/fileHandler';
import fileHandlerService from '~/framework/util/fileHandler/service';
import { getUserSession } from '~/framework/util/session';

export function downloadAttachmentAction(att: IDistantFile, navigation: NavigationInjectedProps['navigation']) {
  return async (dispatch: Dispatch, getState: () => IGlobalState) => {
    try {
      const session = getUserSession();
      (await fileHandlerService.downloadFile(session, att, {})).open(navigation);
    } catch (errmsg) {
      // TODO: Manage error
    }
  };
}
