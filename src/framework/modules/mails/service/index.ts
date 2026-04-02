import { getSession } from '~/framework/modules/auth/redux/reducer';
import { getMailCarbonioRight } from '~/framework/modules/mails/rights';
import { carbonioMailsApi, getCarbonioAuthToken } from '~/framework/modules/mails/service/api/carbonio';
import { mailsApi } from '~/framework/modules/mails/service/api/mails';

const sessionUser = getSession();

if (sessionUser && getMailCarbonioRight(sessionUser)) {
  // Fire-and-forget prefetch of Carbonio auth token; errors are logged but non-blocking.
  getCarbonioAuthToken(sessionUser).catch(e => console.error('Failed to prefetch Carbonio auth token', e));
}

export const mailsService = sessionUser && getMailCarbonioRight(sessionUser) ? carbonioMailsApi : mailsApi;
