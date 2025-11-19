import { FileManagerModuleName, FileManagerUsecaseName } from '~/framework/util/fileHandler/fileManagerConfig';
import { LocalFile } from '~/framework/util/fileHandler/models/localFile';
import { getModuleFileManagerConfig } from '~/framework/util/fileHandler/services/fileManagerRegistry';
import { pickFromCamera, pickFromDocuments, pickFromGallery } from '~/framework/util/fileHandler/services/filePickerService';
import { FileSource } from '~/framework/util/fileHandler/types';

export class FileManager {
  static async pick<M extends FileManagerModuleName, U extends FileManagerUsecaseName<M>>(
    moduleName: M,
    usecaseName: U,
    callback: (files: LocalFile[] | LocalFile) => void,
    options?: { source?: FileSource; callbackOnce?: boolean },
  ): Promise<void> {
    const moduleConfig = getModuleFileManagerConfig(moduleName);
    if (!moduleConfig) throw new Error(`No FileManager config for module ${moduleName}`);

    const config = moduleConfig[usecaseName];
    if (!config) throw new Error(`Unknown usecase ${usecaseName} for module ${moduleName}`);

    const { multiple, sources } = config;
    const source: FileSource = options?.source ?? sources[0];
    const callbackOnce = options?.callbackOnce ?? false;

    let files: LocalFile[] = [];

    switch (source) {
      case 'gallery':
        files = await pickFromGallery({ callbackOnce, multiple });
        break;
      case 'camera':
        files = await pickFromCamera({ callbackOnce });
        break;
      case 'documents':
        files = await pickFromDocuments({ callbackOnce });
        break;
      default:
        throw new Error(`Unsupported source: ${source}`);
    }

    const allowedPrefixes = config.allow.flatMap(t => {
      switch (t) {
        case 'image':
          return ['image/'];
        case 'video':
          return ['video/'];
        case 'audio':
          return ['audio/'];
        case 'pdf':
          return ['application/pdf'];
        case 'document':
          return ['application/', 'text/'];
        default:
          return [];
      }
    });

    files = files.filter(f => allowedPrefixes.some(prefix => f.filetype.startsWith(prefix)));

    callback(files);
  }
}
