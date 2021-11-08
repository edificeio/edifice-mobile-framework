import { createAsyncActionTypes, AsyncState } from "../../../framework/util/redux/async";
import { computeSearchQuery, computeSearchValue, findLongestCommonSubstring } from "../../../framework/util/string";
import conversationConfig from "../moduleConfig";

// THE MODEL --------------------------------------------------------------------------------------

export interface IVisible {
    id: string,
    profile: string,
}
export interface IVisibleUser extends IVisible {
    displayName: string;
}
export interface IVisibleGroup extends IVisibleUser {
    groupDisplayName: string,
    name: string,
    structureName: string,
}

export interface IVisibles {
    groups: IVisibleGroup[],
    users: IVisibleUser[]
}

// THE STATE --------------------------------------------------------------------------------------

export type IVisiblesState = AsyncState<IVisibles>;

export const initialState: IVisibles = { groups: [], users: [] };

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(conversationConfig.namespaceActionType("VISIBLES"));

// THE UTILITARY ----------------------------------------------------------------------------------

export const searchVisibles = (visibles: IVisibles, query: string, omitResults?: Array<IVisibleGroup | IVisibleUser>, limit?: number, threshold?: number) => {
    // console.log("visibles", visibles);
    const queryWords = computeSearchQuery(query);
    const computeScoreString = (s: string) => queryWords.reduce((score, q) => {
        const str = computeSearchValue(s);
        const common = q.length && str.includes(q);
        return score + (common ? 1 : 0);
    }, 0);
    const computeScoreUser = (v: IVisibleUser) => computeScoreString(v.displayName);
    const computeScoreGroup = (v: IVisibleGroup) => computeScoreString(v.groupDisplayName || v.name);
    const filterFunc = (v: { score: number }) => v.score >= (threshold ?? 1);
    const omitIds = omitResults ? omitResults.map(v => v.id) : [];
    // console.log("omitIds", omitIds)
    const filterFunc2 = (v: IVisibleGroup | IVisibleUser) => !omitIds.includes(v.id);
    const sortFunc = (a: { score: number }, b: { score: number }) => b.score - a.score;
    const computed = [
        ...visibles.groups.map(g => ({ ...g, score: computeScoreGroup(g) })),
        ...visibles.users.map(u => ({ ...u, score: computeScoreUser(u) }))
    ];
    // console.log("computed", computed);
    const res = computed.filter(filterFunc).filter(filterFunc2).sort(sortFunc).slice(0, limit ?? 20) as Array<IVisibleGroup | IVisibleUser>;
    // console.log("res", res);
    return res;
}