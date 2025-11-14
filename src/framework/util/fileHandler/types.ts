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

export type AllowedFileType = 'image' | 'video' | 'audio' | 'pdf' | 'document';

export type FileSource = 'camera' | 'gallery' | 'documents';

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

export interface FileManagerModule {
  [usecase: string]: FileManagerUsecase;
}

/**
 * Global configuration for all modules.
 * Each key = module name -> contains a set of usecases.
 */
export interface FileManagerGlobalConfig {
  [module: string]: FileManagerModule;
}
