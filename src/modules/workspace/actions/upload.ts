import getPath from '@flyerhq/react-native-android-uri-path';
import { Platform } from 'react-native';

import { createAsyncActionTypes } from '~/framework/util/redux/async';
import { Trackers } from '~/framework/util/tracker';
import { ContentUri } from '~/modules/workspace/types';

import { uploadDocumentAction } from './helpers/documents';

export const actionTypesUpload = createAsyncActionTypes('WORKSPACE_UPLOAD');

export function uploadRequested(parentId) {
  return {
    type: actionTypesUpload.request,
    payload: {
      parentId,
    },
  };
}

export function uploadReceived(parentId, data: any) {
  return {
    type: actionTypesUpload.receipt,
    data,
    receivedAt: Date.now(),
    payload: {
      parentId,
    },
  };
}

export function uploadError(parentId, errmsg: string) {
  return {
    type: actionTypesUpload.error,
    error: true,
    errmsg,
    payload: {
      parentId,
    },
  };
}

/**
 * Take a file from the mobile and post it to the backend.
 * Dispatches WORKSPACE_UPLOAD_REQUESTED, WORKSPACE_UPLOAD_RECEIVED, and WORKSPACE_UPLOAD_FETCH_ERROR if an error occurs.
 */
export function uploadAction(parentId: string, uriContent: ContentUri[] | ContentUri, doTrack: boolean = true) {
  return async (dispatch: any) => {
    try {
      const content = Array.isArray(uriContent) ? uriContent : [uriContent];
      for (uriContent of content) {
        uriContent.uri = Platform.select({
          android: getPath(uriContent.uri),
          default: decodeURI(uriContent.uri.indexOf('file://') > -1 ? uriContent.uri.split('file://')[1] : uriContent.uri),
        });
      }
      dispatch(uploadRequested(parentId));
      const files = await dispatch(uploadDocumentAction(content, parentId));
      dispatch(uploadReceived(parentId, files));
      if (doTrack) {
        Trackers.trackEvent('Workspace', 'UPLOAD');
      }
    } catch (ex) {
      dispatch(uploadError(parentId, ex));
    }
  };
}
