import { copyAction, cutAction, pastAction } from "../actions/copypast";
import { FilterId } from "../types/filters";
import { listAction } from "../actions/list";
import { deleteAction } from "../actions/delete";

export function copyDocuments({ navigation, dispatch, selected }) {
  dispatch(copyAction(selected));
  navigation.push("Workspace", { filter: FilterId.owner, parentId: FilterId.owner });
}

export function cutDocuments({ navigation, dispatch, selected }) {
  dispatch(cutAction(selected));
  navigation.push("Workspace", { filter: FilterId.owner, parentId: FilterId.owner });
}

export function pastDocuments({ dispatch, parentId, cut, selected }) {
  if (cut)
    dispatch(pastAction(parentId, selected))
      .then(() => dispatch(deleteAction(parentId, selected)))
      .then(() => dispatch(listAction({ parentId, filter: FilterId.owner })));
  else dispatch(pastAction(parentId, selected)).then(() => dispatch(listAction({ parentId, filter: FilterId.owner })));
}
