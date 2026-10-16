import appConf from '~/framework/util/appConf';
import { platformFetch } from '~/framework/util/transport';
import type { ForgotMode } from '~/modules/auth/model';

export interface ForgotResponse {
  ok: boolean;
  structures?: any[];
  error?: string;
}

/**
 * Asks the platform to send a mail to reset the password, or to remind the login id.
 */
export async function forgot<Mode extends 'password'>(
  platformName: string,
  mode: Mode,
  payload: { login: string },
): Promise<ForgotResponse>;
export async function forgot<Mode extends 'id'>(
  platformName: string,
  mode: Mode,
  payload: { mail: string } | { mail: string; firstName: string; structureId: string },
): Promise<ForgotResponse>;
export async function forgot<Mode extends ForgotMode>(
  platformName: string,
  mode: Mode,
  payload: { login: string } | { mail: string } | { mail: string; firstName: string; structureId: string },
): Promise<ForgotResponse> {
  const realPayload = { ...payload, service: 'mail' };
  const api = mode === 'id' ? `/auth/forgot-id` : `/auth/forgot-password`;
  const res = await platformFetch(appConf.assertPlatformOfName(platformName), api, {
    body: JSON.stringify(realPayload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  const resStatus = res.status;
  const resJson = await res.json();
  const ok = resStatus >= 200 && resStatus < 300;
  return { ...resJson, ok };
}
