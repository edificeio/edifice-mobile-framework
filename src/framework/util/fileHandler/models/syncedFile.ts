import { LocalFile } from './localFile';

export interface IDistantFile {
  url: string;
  filename?: string;
  filetype?: string;
  filesize?: number;
}

export interface IDistantFileWithId extends IDistantFile {
  id: string;
}

export class SyncedFile<DFType extends IDistantFile = IDistantFile> implements IDistantFile {
  df: DFType;
  lf: LocalFile;

  constructor(localFile: LocalFile, distantFile: DFType) {
    this.df = distantFile;
    this.lf = localFile;
  }

  get url() {
    return this.df.url;
  }
  get filename() {
    return this.df.filename ?? this.lf.filename;
  }
  get filetype() {
    return this.df.filetype ?? this.lf.filetype;
  }
  get filepath() {
    return this.lf.filepath;
  }

  releaseIfNeeded = () => this.lf.releaseIfNeeded();
  open = () => this.lf.open();

  moveToDownloadFolder() {
    return this.lf.moveToDownloadFolder();
  }

  setExtension(ext: string) {
    return this.lf.setExtension(ext);
  }

  setPath(path: string) {
    return this.lf.setPath(path);
  }
}

export class SyncedFileWithId extends SyncedFile<IDistantFileWithId> {
  get id() {
    return this.df.id;
  }
}

export interface IAnyDistantFile extends IDistantFile {
  [key: string]: any;
}
