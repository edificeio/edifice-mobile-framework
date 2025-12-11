import { LocalFile } from '~/framework/util/fileHandler/models';
import { normalizePickerError } from '~/framework/util/fileHandler/pickerErrors/normalizePickerError';
import { getModuleFileManagerConfig } from '~/framework/util/fileHandler/services/fileManagerRegistry';
import {
  pickAudio,
  pickFromCamera,
  pickFromDocuments,
  pickFromGallery,
} from '~/framework/util/fileHandler/services/filePickerService';
import { FileManagerStandalonePickOptions, FileManagerUsecase, FileSource } from '~/framework/util/fileHandler/types';
import { assertPermissions, PermissionScenario } from '~/framework/util/permissions';

export class FileManager {
  static async pick(callback: (files: LocalFile[]) => void, opts: FileManagerStandalonePickOptions): Promise<void> {
    let config: FileManagerUsecase | undefined;
    let source: FileSource | undefined;
    const override = opts.configOverride ?? {};
    const onError = opts.onError ?? (() => {});

    try {
      //standalone config block
      if (opts.standaloneConfig) {
        config = opts.standaloneConfig;
        source = opts.source ?? config.sources[0];

        console.debug('[FileManager] Running in STANDALONE mode');
        console.debug('[FileManager] allow=', config.allow);
        console.debug('[FileManager] sources=', config.sources);
        console.debug('[FileManager] chosen source=', source);

        //module compatibility here
      } else {
        if (!opts.module || !opts.usecase)
          throw new Error('FileManager.pick: module and usecase are required when not in standalone mode');

        const moduleConfig = getModuleFileManagerConfig(opts.module);
        if (!moduleConfig) throw new Error(`No FileManager config for module ${opts.module}`);

        config = moduleConfig[opts.usecase];
        if (!config) throw new Error(`Unknown usecase ${opts.usecase} for module ${opts.module}`);

        source = opts.source ?? config.sources[0];

        console.debug(`[FileManager] Module=${opts.module} Usecase=${opts.usecase}`);
        console.debug('[FileManager] allow=', config.allow);
        console.debug('[FileManager] sources=', config.sources);
        console.debug('[FileManager] chosen source=', source);
      }

      if (!source) {
        throw new Error('FileManager.pick: no file source selected');
      }

      const sourceToPermission: Partial<Record<FileSource, PermissionScenario>> = {
        audio: 'audio.read',
        camera: 'camera',
        documents: 'documents.read',
        gallery: 'gallery.read',
      };

      const permission = sourceToPermission[source];

      try {
        if (permission) await assertPermissions(permission);
      } catch (err) {
        console.warn('[FileManager] Permission denied:', err);
        callback([]);
        return;
      }

      let files: LocalFile[] = [];
      // gallery allowed types
      const allowedTypesForGallery =
        override.gallery?.allowedTypes ?? (config.allow.filter(t => ['image', 'video'].includes(t)) as Array<'image' | 'video'>);

      switch (source) {
        case 'gallery':
          files = await pickFromGallery({
            allowedTypes: allowedTypesForGallery,
            multiple: override.gallery?.multiple ?? config.multiple,
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
            multiple: override.documents?.multiple ?? config.multiple,
            types: override.documents?.types,
          });
          break;

        case 'audio':
          files = await pickAudio({
            multiple: override.audio?.multiple ?? config.multiple,
            types: override.audio?.types ?? ['audio/*'],
          });
          break;

        default:
          throw new Error(`Unsupported FileSource: ${source}`);
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

      const skipMimeFilter = source === 'documents';

      if (!skipMimeFilter) {
        files = files.filter(f => allowedPrefixes.some(prefix => f.filetype?.startsWith(prefix)));
      }

      console.debug('[FileManager] Final files returned:', files);

      callback(files);
    } catch (err) {
      const normalized = normalizePickerError(err, source!);

      // console.debug('[MANAGER_NORMALIZED_ERROR] =', normalized);
      onError(normalized);
      callback([]);
    }
  }
}
