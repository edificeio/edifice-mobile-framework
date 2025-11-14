/**
 * Public API for the FileManager.
 * Exposes:
 *  - FileManager.pick()  (main entry point)
 *  - LocalFile / SyncedFile models
 *  - Types & Config
 */

import { FileManagerConfig, FileManagerModuleName, FileManagerUsecaseName } from '../fileManagerConfig';
import { LocalFile } from '../models/localFile';
import { FileSource } from '../types';
import { pickFromCamera, pickFromDocuments, pickFromGallery } from './filePickerService';

export class FileManager {
  /**
   * Generic & strongly typed file picker.
   */
  static async pick<M extends FileManagerModuleName, U extends FileManagerUsecaseName<M>>(
    moduleName: M,
    usecaseName: U,
    callback: (files: LocalFile[]) => void,
    options?: { source?: FileSource },
  ): Promise<void> {
    const moduleConfig = FileManagerConfig[moduleName];
    const config = moduleConfig[usecaseName] ?? moduleConfig.default;

    if (!config) throw new Error(`Unknown FileManager config for ${moduleName}.${usecaseName}`);

    const { multiple, sources } = config;

    // auto select first allowed source if not provided
    const source: FileSource = options?.source ?? sources[0];

    switch (source) {
      case 'gallery':
        return pickFromGallery(callback, multiple);

      case 'camera':
        return pickFromCamera(callback);

      case 'documents':
        return pickFromDocuments(callback);

      default:
        throw new Error(`Unsupported source: ${source}`);
    }
  }
}
