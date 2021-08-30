import { getUserSession } from "../../../util/session";
import workspaceService from "../service";
import { ThunkDispatch } from "redux-thunk";

export const createFolderAction = (name: string, parentFolderId?: string) =>
    (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
        const session = getUserSession(getState());
        return workspaceService.createFolder(session, name, parentFolderId);
    }
