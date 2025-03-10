// /**
//  * Diary entry creation actions
//  */

import { Moment } from 'moment';
import { ThunkDispatch } from 'redux-thunk';

import { assertSession } from '~/framework/modules/auth/reducer';
import homeworkConfig from '~/framework/modules/homework/module-config';
import workspaceFileTransferActions from '~/framework/modules/workspace/actions/fileTransfer';
import { IDistantFile, IMAGE_MAX_DIMENSION, LocalFile } from '~/framework/util/fileHandler';
import { createUUID } from '~/framework/util/string';
import { signedFetch } from '~/infra/fetchWithCache';
import { asyncActionTypes } from '~/infra/redux/async';

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypes = asyncActionTypes(homeworkConfig.namespaceActionType('CREATE_ENTRY'));

export function homeworkCreateEntryInvalidated() {
  return { type: actionTypes.invalidated };
}

export function homeworkCreateEntryRequested() {
  return { type: actionTypes.requested };
}

export function homeworkCreateEntryReceived() {
  return { receivedAt: Date.now(), type: actionTypes.received };
}

export function homeworkCreateEntryFetchError(errmsg: string) {
  return { errmsg, error: true, type: actionTypes.fetchError };
}

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Upload images for a given diary entry.
 * Info: no reducer is used in this action.
 */
export function uploadHomeworkDiaryEntryImages(images: LocalFile[]) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    return dispatch(
      workspaceFileTransferActions.uploadFilesAction(images, {
        parent: 'protected',
      }),
    );
  };
}

/**
 * Create a new entry within a given diary.
 * Info: no reducer is used in this action.
 */
export function createHomeworkDiaryEntry(
  diaryId: string,
  date: Moment,
  title: string,
  content: string,
  uploadedImages?: IDistantFile[],
) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const session = assertSession();

    dispatch(homeworkCreateEntryRequested());
    try {
      const entryId = createUUID();
      let contentHtml = `<div>${content}<div>`;
      if (uploadedImages) {
        const entryImageUploads = Object.values(uploadedImages);
        const images = entryImageUploads
          .map(entryImageUpload => `<img src="${entryImageUpload.url}?thumbnail=${IMAGE_MAX_DIMENSION}x0" class="">`)
          .join('');
        const imagesHtml = `<p class="ng-scope" style="">
        <span contenteditable="false" class="image-container ng-scope" style="">
          ${images}
        </span>
      </p>`;
        contentHtml = contentHtml + imagesHtml;
      }

      await signedFetch(`${session?.platform.url}/homeworks/${diaryId}/entry`, {
        body: JSON.stringify({
          date: date?.format('YYYY-MM-DD'),
          entryid: entryId,
          title,
          value: contentHtml,
        }),
        method: 'PUT',
      });
      dispatch(homeworkCreateEntryReceived());
      return entryId;
    } catch (error) {
      dispatch(homeworkCreateEntryFetchError(error as string));
      throw error;
    }
  };
}
