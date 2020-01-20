import pickFileAction from "../../infra/actions/pickFile";
import { uploadAction } from "../actions/upload";

export const pickFile = ({ dispatch, parentId }: any) => {
  pickFileAction().then(contentUri => {
    dispatch(uploadAction(parentId, contentUri));
  });
};
