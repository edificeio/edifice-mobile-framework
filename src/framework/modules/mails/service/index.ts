import { getSession } from '~/framework/modules/auth/reducer';
import { getMailCarbonioRight } from '~/framework/modules/mails/rights';
import { carbonioMailsApi } from '~/framework/modules/mails/service/api/carbonio';
import { mailsApi } from '~/framework/modules/mails/service/api/mails';

const sessionUser = getSession();

export const mailsService = getMailCarbonioRight(sessionUser!) ? carbonioMailsApi : mailsApi;
