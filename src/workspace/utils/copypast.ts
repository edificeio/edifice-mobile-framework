import { moveAction } from "../actions/move";
import { pastAction } from "../actions/past";

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
  dispatch(moveAction(value, parentId, selected));
}
