import moment from 'moment';

import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes as registerActionTypes } from '~/modules/viescolaire/presences/state/teacherCourseRegister';
import { actionTypes, initialState } from '~/modules/viescolaire/presences/state/teacherCourses';

export default createSessionAsyncReducer(initialState, actionTypes, {
  [actionTypes.receipt]: (data, action) => action.data.sort((a, b) => moment(a.startDate).diff(moment(b.startDate))),
  [registerActionTypes.receipt]: (state, action) =>
    state.map(course => {
      if (course.id !== action.data.course_id) return course;
      else return { ...course, registerId: action.data.id };
    }),
});
