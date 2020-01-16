import pickFileAction from "../../infra/actions/pickFile";
import { uploadAction } from "../actions/upload";

export const pickFile = ({ dispatch }: any) => {
  pickFileAction().then(contentUri => {
    dispatch(uploadAction(contentUri));
  });
};
