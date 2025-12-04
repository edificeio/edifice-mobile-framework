import { LocalFile } from '~/framework/util/fileHandler/models/localFile';
import { ILocalAttachment } from '~/ui/Attachment';

export function mapLocalFileToLegacy(lf: LocalFile): ILocalAttachment {
  return {
    mime: lf.filetype,
    name: lf.filename,
    uri: lf._filepathNative ?? lf.filepath,
  };
}
