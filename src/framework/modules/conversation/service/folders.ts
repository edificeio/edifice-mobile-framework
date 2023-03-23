import { ICountMailboxes } from '~/framework/modules/conversation/state/count';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

// Data type of what is given by the backend.
export type FoldersBackend = {
  parent_id: string;
  trashed: boolean;
  depth: number;
  name: string;
  id: string;
}[];

export const foldersService = {
  post: async (name: string, parentId: string | null = null) => {
    const body = {
      name,
    } as any;
    if (parentId) body.parentId = parentId;
    const response = await fetchJSONWithCache(`/conversation/folder`, {
      method: 'post',
      body: JSON.stringify(body),
    });
    return response;
  },
  count: async () => {
    const ids = ['INBOX', 'DRAFT'];
    const promises: Promise<any>[] = [];
    ids.forEach(id => {
      promises.push(fetchJSONWithCache(`/conversation/count/${id}?unread=${id === 'DRAFT' ? 'false' : 'true'}`));
    });
    const results = await Promise.all(promises);
    const ret: ICountMailboxes = results.reduce((acc, res, i) => {
      const newAcc = { ...acc };
      newAcc[`${ids[i]}`] = res.count;
      return newAcc;
    }, {});
    return ret;
  },
};
