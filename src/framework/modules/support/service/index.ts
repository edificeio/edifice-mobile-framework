import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { SyncedFileWithId } from '~/framework/util/fileHandler';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

interface IBackendTicket {
  id: number | null;
  school_id: string;
  status: number;
  created: string;
  modified: string;
  escalation_status: number;
  escalation_date: string | null;
  short_desc: string;
  owner_name: string;
  owner: string;
}

export const supportService = {
  ticket: {
    post: async (
      session: AuthLoggedAccount,
      category: string,
      structure: string,
      subject: string,
      description: string,
      attachments?: SyncedFileWithId[],
    ) => {
      const api = '/support/ticket';
      const body = JSON.stringify({
        attachments: attachments?.map(a => ({
          id: a.df.id,
          name: a.filename,
          size: a.filesize,
        })),
        category,
        description,
        school_id: structure,
        subject,
      });
      const ticket = (await fetchJSONWithCache(api, {
        body,
        method: 'POST',
      })) as IBackendTicket;
      return ticket.id;
    },
  },
};
