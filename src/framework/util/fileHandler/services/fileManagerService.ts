import { FileManagerModuleName, FileManagerUsecaseName } from '~/framework/util/fileHandler/fileManagerConfig';
import { LocalFile } from '~/framework/util/fileHandler/models/localFile';
import { getModuleFileManagerConfig } from '~/framework/util/fileHandler/services/fileManagerRegistry';
import {
  pickAudio,
  pickFromCamera,
  pickFromDocuments,
  pickFromGallery,
} from '~/framework/util/fileHandler/services/filePickerService';
import { FileManagerPickerOptionsType, FileSource } from '~/framework/util/fileHandler/types';
import { assertPermissions, PermissionScenario } from '~/framework/util/permissions';

export class FileManager {
  static async pick<M extends FileManagerModuleName, U extends FileManagerUsecaseName<M>>(
    moduleName: M,
    usecaseName: U,
    callback: (files: LocalFile[] | LocalFile) => void,
    options?: FileManagerPickerOptionsType,
  ): Promise<void> {
    const moduleConfig = getModuleFileManagerConfig(moduleName);
    if (!moduleConfig) throw new Error(`No FileManager config for module ${moduleName}`);

    const config = moduleConfig[usecaseName];
    if (!config) throw new Error(`Unknown usecase ${usecaseName} for module ${moduleName}`);

    const { multiple, sources } = config;
    const source: FileSource = options?.source ?? sources[0];
    const override = options?.configOverride ?? {};

    console.debug(`[FileManager] Module=${moduleName} Usecase=${usecaseName}`);
    console.debug(`[FileManager] allow=`, config.allow);
    console.debug(`[FileManager] sources=`, config.sources);
    console.debug(`[FileManager] chosen source=`, source);

    let files: LocalFile[] = [];
    const sourceToPermission: Partial<Record<FileSource, PermissionScenario>> = {
      audio: 'audio.read',
      camera: 'camera',
      documents: 'documents.read',
      gallery: 'gallery.read',
    };

    const permissionToAsk = sourceToPermission[source];

    try {
      if (permissionToAsk) await assertPermissions(permissionToAsk);
    } catch (err) {
      console.warn('[FileManager] Permission denied:', err);
      callback([]);
      return;
    }

    // allowedTypes for gallery
    const allowedTypesForGallery =
      override.gallery?.allowedTypes ?? (config.allow.filter(t => ['image', 'video'].includes(t)) as Array<'image' | 'video'>);

    switch (source) {
      case 'gallery':
        files = await pickFromGallery({
          allowedTypes: allowedTypesForGallery,
          multiple: override.gallery?.multiple ?? multiple,
        });
        break;

      case 'camera':
        files = await pickFromCamera({
          mode: override.camera?.mode,
          useFrontCamera: override.camera?.useFrontCamera ?? false,
        });
        break;

      case 'documents':
        files = await pickFromDocuments({
          multiple: override.documents?.multiple ?? multiple,
          types: override.documents?.types,
        });
        break;
      case 'audio':
        files = await pickAudio({
          multiple: override.audio?.multiple ?? multiple,
          types: override.audio?.types ?? ['audio/*'],
        });
        break;

      default:
        throw new Error(`Unsupported source: ${source}`);
    }

    // MIME filtering
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

    files = files.filter(f => allowedPrefixes.some(prefix => f.filetype?.startsWith(prefix)));

    console.debug('[FileManager] Final files returned:', files);

    callback(files);
  }
}
