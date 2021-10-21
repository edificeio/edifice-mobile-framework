import { IUserSession } from "../../../framework/util/session";
import { fetchJSONWithCache, signedFetchJson } from "../../../infra/fetchWithCache";
import { IVisibles } from "../state/visibles";

export const visiblesService = {
    get: async (session: IUserSession) => {
        const api = '/conversation/visible';
        return signedFetchJson(api) as Promise<IVisibles>;
    }
}