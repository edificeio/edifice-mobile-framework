import { ThunkDispatch } from "redux-thunk";

import { getUserSession } from "~/framework/util/session";

import workspaceService from "../service";

export const createFolderAction = (name: string, parentFolderId?: string) =>
    (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
        const session = getUserSession(getState());
        return workspaceService.createFolder(session, name, parentFolderId);
    }
