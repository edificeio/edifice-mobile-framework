import { Dispatch } from "redux";
import { IGlobalState } from "../../../AppStore";
import { getUserSession } from "../../../framework/util/session";
import fileHandlerService from '../../../framework/util/fileHandler/service';
import { IDistantFile } from "../../../framework/util/fileHandler";

export function downloadAttachmentAction(att: IDistantFile) {
    return async (dispatch: Dispatch, getState: () => IGlobalState) => {
        try {
            const session = getUserSession(getState());
            (await fileHandlerService.downloadFile(session, att, {})).open();
        } catch (errmsg) {
            console.warn("Error downloading attachment", errmsg);
        }
    };
}