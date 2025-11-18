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

    switch (source) {
      case 'gallery':
        return pickFromGallery({ callbackOnce, multiple }).then(callback);

      case 'camera':
        return pickFromCamera({ callbackOnce }).then(callback);

      case 'documents':
        return pickFromDocuments({ callbackOnce }).then(callback);

      default:
        throw new Error(`Unsupported source: ${source}`);
    }
  }
}
