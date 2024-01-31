import { LocalFile } from '~/framework/util/fileHandler';

export type ContentUri = {
  mime: string;
  name: string;
  path: string;
  uri: string;
};

export const contentUriToLocalFile = (ct: ContentUri) =>
  new LocalFile(
    {
      name: ct.name,
      filename: ct.name,
      filepath: ct.uri,
      filetype: ct.mime,
    },
    { _needIOSReleaseSecureAccess: false },
  );
