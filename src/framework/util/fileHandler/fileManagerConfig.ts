/**
 * FileManagerConfig
 * ------------------
 * Centralized configuration for file imports for each module.
 *
 * Each module contains a set of "usecases" (editor, attachments, avatar, etc.).
 * Each usecase defines:
 *  - the allowed file types
 *  - the available sources (camera, gallery, documents)
 *  - whether multiple file selection is allowed
 */

import { FileManagerGlobalConfig } from './types';

/**
 * Module config.
 * This config has no direct functional impact: it only acts as a mapping
 * to describe “what is allowed” and “from where files can be imported”.
 */

export const FileManagerConfig: FileManagerGlobalConfig = {
  blog: {
    editor: {
      allow: ['image'],
      multiple: false,
      sources: ['camera', 'gallery'],
    },
  },
  mails: {
    attachments: {
      allow: ['image', 'document'],
      multiple: true,
      sources: ['camera', 'gallery', 'documents'],
    },

    editor: {
      allow: ['image'],
      multiple: false,
      sources: ['camera', 'gallery'],
    },
  },

  presence: {
    justification: {
      allow: ['image', 'pdf'],
      multiple: false,
      sources: ['camera', 'gallery', 'documents'],
    },
  },
  profile: {
    avatar: {
      allow: ['image'],
      multiple: false,
      sources: ['camera', 'gallery'],
    },
  },
  support: {
    attachments: {
      allow: ['image', 'pdf', 'document'],
      multiple: true,
      sources: ['camera', 'gallery', 'documents'],
    },
  },
  workspace: {
    upload: {
      allow: ['image', 'pdf', 'document'],
      multiple: true,
      sources: ['camera', 'gallery', 'documents'],
    },
  },
} as const;

/**
 * Strong typing helpers for FileManager.pick()
 */
export type FileManagerModuleName = keyof typeof FileManagerConfig;

export type FileManagerUsecaseName<M extends FileManagerModuleName> = Extract<keyof FileManagerGlobalConfig[M], string>;
