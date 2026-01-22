import { getFileManagerConfig } from '~/framework/util/fileHandler/services/fileManagerRegistry';

export type FileManagerModuleName = keyof ReturnType<typeof getFileManagerConfig>;

export type FileManagerUsecaseName<M extends FileManagerModuleName> = Extract<
  keyof NonNullable<ReturnType<typeof getFileManagerConfig>[M]>,
  string
>;
