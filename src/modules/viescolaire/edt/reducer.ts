/**
 * Sub-module EDT Reducer
 */
import { IEdtCourseListState } from './state/edtCourses';
import { ISlotListState } from './state/slots';
import { IEdtUserChildrenState } from './state/userChildren';

// State

export interface IEdt_State {
  slotsList: ISlotListState;
  userChildren: IEdtUserChildrenState;
  edtCourseList: IEdtCourseListState;
}
