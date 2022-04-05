export const getFileIcon = (type: string) => {
  switch (type) {
    case 'image/png':
    case 'image/jpeg':
    case 'image/jpg':
    case 'image/gif':
      return 'picture';
    case 'audio/mpeg':
    case 'audio/ogg':
      return 'file-audio';
    case 'video/mpeg':
    case 'video/ogg':
      return 'file-video-outline';
    case 'application/pdf':
      return 'pdf_files';
    case 'text/html':
    default:
      return 'file-document-outline';
  }
};
