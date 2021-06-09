import { createSessionAsyncReducer } from "../../../infra/redux/async2";
import { initialStateRegister, actionTypesRegister } from "../state/teacherCourses";

export default createSessionAsyncReducer(initialStateRegister, actionTypesRegister);
