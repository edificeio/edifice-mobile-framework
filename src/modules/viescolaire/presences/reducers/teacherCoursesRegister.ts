import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialStateRegister, actionTypesRegister } from '~/modules/viescolaire/presences/state/teacherCourses';

export default createSessionAsyncReducer(initialStateRegister, actionTypesRegister);
