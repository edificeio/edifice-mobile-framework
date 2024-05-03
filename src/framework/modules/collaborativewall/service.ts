import { signedFetchJsonRelative } from '~/infra/fetchWithCache';

// example : /collaborativewall#/view/d12e609a-6d77-418f-80f6-04ddddfa76d6
export type CollaborativewallResourceUri = `/collaborativewall#/view/${string}`;
export type CollaborativewallIdentifier = string;

export const collaborativewallUriParser = {
  parse: (uri?: CollaborativewallResourceUri | string) => {
    const idRegex = /^\/collaborativewall\/id\/([a-f0-9-]{36})\/?/;
    const idOldRegex = /^\/collaborativewall#\/view\/([a-f0-9-]{36})\/?/;
    let cwallIdMatch = uri && uri.match(idRegex);
    if (uri && !cwallIdMatch) cwallIdMatch = uri.match(idOldRegex);
    return cwallIdMatch?.[1] as CollaborativewallIdentifier | undefined;
  },

  stringify: (id: CollaborativewallIdentifier) => `/collaborativewall/id/${id}` as CollaborativewallResourceUri,
};

export const collaborativewallService = {
  get: async (id: string) => {
    const api = `/collaborativewall/${id}`;
    return signedFetchJsonRelative(api);
  },
};
