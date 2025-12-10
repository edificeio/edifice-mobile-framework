import { FileManagerModuleName, FileManagerUsecaseName } from '~/framework/util/fileHandler/fileManagerConfig';

export interface Asset {
  base64?: string;
  uri?: string;
  width?: number;
  height?: number;
  originalPath?: string;
  fileSize?: number;
  type?: string;
  fileName?: string;
  name?: string;
  duration?: number;
  bitrate?: number;
  timestamp?: string;
  id?: string;
}

/** Allowed types that a module usecase can accept */
export type AllowedFileType = 'image' | 'video' | 'audio' | 'pdf' | 'document';

/** Possible pick sources */
export type FileSource = 'camera' | 'gallery' | 'documents' | 'audio';

/**
 * A configuration entry describing a single import usecase inside a module.
 *
 * @property allow   The allowed file types (image, video, audio, pdf, document).
 * @property sources The available sources (camera, gallery, documents).
 * @property multiple Whether multiple selection is allowed.
 */
export interface FileManagerUsecase {
  allow: AllowedFileType[];
  sources: FileSource[];
  multiple: boolean;
}

/**
 * A module-level FileManager configuration.
 * Each key corresponds to a usecase (ex: "attachment", "editor").
 */
export interface IModuleFileManagerConfig {
  [usecase: string]: FileManagerUsecase;
}

/**
 * Optional overrides applied when calling FileManager.pick().
 * These settings affect only the current pick operation.
 *
 * @property source          Forces a specific source (camera, gallery, documents, audio).
 * @property callbackOnce    If true, callback is called once with all results.
 * @property configOverride  Optional per-source overrides.
 */
export interface FileManagerPickerOptionsType {
  source?: FileSource;
  configOverride?: FileManagerConfigOverrideType;
}

export type FileManagerConfigOverrideType = {
  gallery?: {
    allowedTypes?: Array<'image' | 'video'>;
    multiple?: boolean;
  };

  camera?: {
    useFrontCamera?: boolean;
    mode?: 'photo' | 'video';
  };

  documents?: {
    multiple?: boolean;
    types?: string[];
  };

  audio?: {
    types?: string[];
    multiple?: boolean;
  };
};

export type FileManagerStandalonePickOptions = {
  standaloneConfig?: FileManagerUsecase;
  module?: FileManagerModuleName;
  usecase?: FileManagerUsecaseName<FileManagerModuleName>;
  source?: FileSource;
  configOverride?: FileManagerPickerOptionsType['configOverride'];
};
