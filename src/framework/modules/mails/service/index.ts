import { getSession } from '~/framework/modules/auth/redux/reducer';
import { getMailCarbonioRight } from '~/framework/modules/mails/rights';
import { carbonioMailsApi } from '~/framework/modules/mails/service/api/carbonio';
import { mailsApi } from '~/framework/modules/mails/service/api/mails';

const getActiveService = () => {
  const s = getSession();
  return s && getMailCarbonioRight(s) ? carbonioMailsApi : mailsApi;
};

export const mailsService = {
  get attachments() { return getActiveService().attachments; },
  get bookmark() { return getActiveService().bookmark; },
  get folder() { return getActiveService().folder; },
  get folders() { return getActiveService().folders; },
  get mail() { return getActiveService().mail; },
  get mails() { return getActiveService().mails; },
  get signature() { return getActiveService().signature; },
  get visibles() { return getActiveService().visibles; },
};
