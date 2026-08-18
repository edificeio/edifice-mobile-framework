import RNFS from 'react-native-fs';

import { getStore } from '~/app/store';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import { LocalFile } from '~/framework/util/fileHandler/models';

export function getCarbonioBaseUrl(): string | undefined {
  return getSession()?.platform.carbonioUrl;
}
export function getCarbonioSoapBaseUrl(): string | undefined {
  const base = getCarbonioBaseUrl();
  return base ? `${base}/service/soap` : undefined;
}
export function getCarbonioEmailDomain(): string | undefined {
  return getSession()?.platform.carbonioEmailDomain;
}

export function getCarbonioTokenFromStore(): string {
  const session = getSession();
  if (!session) return '';
  return getStore().getState().auth.accounts[session.user.id]?.tokens?.carbonioToken ?? '';
}

/**
 * Upload a local file to Carbonio and return the temporary attachment ID (aid).
 * Uses Cookie auth — NOT the ENT Bearer token — so RNFS is called directly
 * instead of going through fileTransferService (which prefixes the platform URL).
 *
 * Carbonio response format (plain text, not JSON): 200,"<csrf>","<aid>,<name>,<size>"
 */
export async function uploadFileToCarbonio(file: LocalFile): Promise<string> {
  const token = getCarbonioTokenFromStore();
  if (!token) throw new Error('Carbonio: no auth token');
  const job = RNFS.uploadFiles({
    binaryStreamOnly: true,
    files: [{ ...file, name: file.filename }],
    headers: {
      'Content-Disposition': `attachment; filename="${file.filename}"`,
      'Content-Type': file.filetype || 'application/octet-stream',
      'Cookie': `ZM_AUTH_TOKEN=${token}`,
    },
    method: 'POST',
    toUrl: `${getCarbonioBaseUrl()}/service/upload?fmt=raw`,
  });
  const res = await job.promise;
  if (res.statusCode < 200 || res.statusCode > 299) throw new Error(`Carbonio upload failed: ${res.statusCode}`);
  const match = res.body.match(/['"][^'"]*['"],['"]([^'"]+)['"]/);
  if (!match) throw new Error(`Carbonio: unexpected upload response: ${res.body}`);
  const aid = match[1].split(',')[0];
  if (!aid) throw new Error('Carbonio: could not parse aid from upload response');
  return aid;
}

/**
 * Build a Carbonio REST URL to fetch a MIME part of a message.
 *
 * disp=a  → attachment (download)
 * disp=i  → inline display (image in body)
 */
/** Strip angle-bracket wrapping from a MIME Content-ID value. */
export function normalizeCid(cid: string): string {
  return cid.replace(/^<|>$/g, '');
}

/**
 * Replace Carbonio part-number URLs in HTML after a MIME restructuring.
 * Called when adding an attachment changes inline-image part numbers.
 */
export function patchInlinePartUrls(html: string, inlinePartMapping: Record<string, string>): string {
  let result = html;
  for (const [oldPart, newPart] of Object.entries(inlinePartMapping)) {
    const escaped = oldPart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`((?:[?&]|&amp;)part=)${escaped}(?=[&"'])`, 'gi'), `$1${newPart}`);
  }
  return result;
}

export function buildCarbonioAttachmentUrl(msgId: string, part: string, disp: 'a' | 'i' = 'a', cid?: string): string {
  const token = getCarbonioTokenFromStore();
  const safePart = encodeURIComponent(part);
  const cidParam = cid ? `&cid=${encodeURIComponent(cid)}` : '';
  return `${getCarbonioBaseUrl()}/service/home/~/?id=${msgId}&part=${safePart}&disp=${disp}&auth=qp&zauthtoken=${encodeURIComponent(token)}${cidParam}`;
}
