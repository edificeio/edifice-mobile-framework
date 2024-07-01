import { AccountType } from '~/framework/modules/auth/model';
import conversationConfig from '~/framework/modules/conversation/module-config';
import { isEmpty } from '~/framework/util/object';
import { AsyncState, createAsyncActionTypes } from '~/framework/util/redux/async';
import { computeSearchQuery, computeSearchValue } from '~/framework/util/string';

// THE MODEL --------------------------------------------------------------------------------------
export enum VisibleType {
  USER = 'User',
  GROUP = 'Group',
  BROADCASTGROUP = 'BroadcastGroup',
  SHAREBOOKMARK = 'ShareBookmark',
}

export interface IVisible {
  id: string;
  displayName: string;
  profile: AccountType;
  type: VisibleType[];
  usedIn: 'TO' | 'CC' | 'CCI'[];
  classrooms?: { id: string; name: string }[];
  subjects?: string[];
  relatives?: { id: string; displayName: string }[];
  children?: { id: string; displayName: string }[];
  functions?: string[];
  disciplines?: { id: string; name: string }[];
  nbUsers?: number;
  groupType?: string;
}

export type IVisibles = IVisible[];

// THE STATE --------------------------------------------------------------------------------------

export type IVisiblesState = AsyncState<IVisibles>;

export const initialState: IVisibles = [];

export const getVisiblesState = (globalState: any) => conversationConfig.getState(globalState).visibles as IVisiblesState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(conversationConfig.namespaceActionType('VISIBLES'));

// THE UTILITARY ----------------------------------------------------------------------------------

export const searchVisibles = (visibles: IVisibles, query: string, omitResults?: IVisibles, limit?: number, threshold?: number) => {
  const queryWords = computeSearchQuery(query);
  const computeScoreString2 = (s: string[]) => {
    let finalScore = 0;
    s.forEach(string => {
      queryWords.reduce((score, q) => {
        const str = computeSearchValue(string);
        const common = q.length && str.includes(q);
        finalScore = score + (common ? 1 : 0);
        if (finalScore > 0) return finalScore;
      }, 0);
    });
    return finalScore;
  };

  const computeScore = (v: IVisible) => {
    let stringsToTest = [v.displayName];
    if (!isEmpty(v.children)) stringsToTest = stringsToTest.concat(v.children!.map(c => c.displayName));
    if (!isEmpty(v.functions)) stringsToTest = stringsToTest.concat(v.functions!);
    if (!isEmpty(v.disciplines)) stringsToTest = stringsToTest.concat(v.disciplines!.map(d => d.name));

    return computeScoreString2(stringsToTest);
  };
  console.log(computeScore, 'test');
  const filterFunc = (v: { score: number }) => v.score >= (threshold ?? 1);
  const omitIds = omitResults ? omitResults.map(v => v.id) : [];
  const filterFunc2 = (v: IVisible) => !omitIds.includes(v.id);
  const sortFunc = (a: { score: number }, b: { score: number }) => b.score - a.score;
  const computed = [] as (IVisible & { score: number })[];

  for (const u of visibles) {
    computed.push({ ...u, score: computeScore(u) });
  }
  const res = computed
    .filter(v => filterFunc(v) && filterFunc2(v))
    .sort(sortFunc)
    .slice(0, limit ?? 20) as IVisibles;
  return res;
};
