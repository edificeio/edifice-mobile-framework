import Share from "react-native-share";
import {downloadOnCache} from "./downloadHelper";
import {IFile} from "../../workspace/types/states";
import Mime from "mime";

export const share = async (downloadable: IFile) => {
  const res = await downloadOnCache( downloadable)
  const path = res.path();

  Share.open({
    type: Mime.getType(path) || 'text/html',
    url:path
  })
};