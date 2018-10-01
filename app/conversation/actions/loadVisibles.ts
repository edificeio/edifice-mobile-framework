import { fetchJSONWithCache } from "../../infra/fetchWithCache";

export const loadVisibles = dispatch => async () => {
  const visibles = await fetchJSONWithCache(`/conversation/visible`);
  dispatch({
    type: "LOAD_VISIBLES_CONVERSATION",
    visibles: [...visibles.groups, ...visibles.users]
  });
};
