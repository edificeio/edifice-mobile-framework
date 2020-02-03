import { pastAction } from "../actions/copypast";
import { deleteAction } from "../actions/delete";

/**
 *
 * @param dispatch
 * @param parentId  the parentId of the copied document
 * @param selected  the list of document to move
 * @param value     the destination folder id
 */
export function copyDocuments({ dispatch, parentId, selected, value }) {
  dispatch(pastAction(value, selected));
}

/**
 *
 * @param dispatch
 * @param parentId  the parentId of the copied document
 * @param selected  The list of document to move
 * @param value     the destination folder id
 */
export function moveDocuments({ dispatch, parentId, selected, value }) {
  dispatch(pastAction(value, selected)).then(() => dispatch(deleteAction(parentId, selected)));
}
