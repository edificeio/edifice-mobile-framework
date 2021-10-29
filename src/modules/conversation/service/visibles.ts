import { legacyAppConf } from "../../../framework/util/appConf";
import { IUserSession } from "../../../framework/util/session";
import { signedFetchJson } from "../../../infra/fetchWithCache";
import { IVisibles } from "../state/visibles";

export const visiblesService = {
    get: async (session: IUserSession) => {
        const api = '/conversation/visible';
        return signedFetchJson(`${legacyAppConf.currentPlatform!.url}${api}`) as Promise<IVisibles>;
    }
}