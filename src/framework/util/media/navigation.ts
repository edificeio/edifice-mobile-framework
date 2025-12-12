import Mime from 'mime';
import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';

import { mimeCompare } from './mime';
import {
  AttachmentMedia,
  AudioMedia,
  // DocumentMedia,
  EmbeddedMedia,
  FileMedia,
  ImageMedia,
  isAttachmentMedia,
  isAudioMedia,
  // isDocumentMedia,
  isEmbeddedMedia,
  isFileMedia,
  isImageMedia,
  isLinkMedia,
  isVideoMedia,
  LinkMedia,
  Media,
  MediaType,
  toURISource,
  VideoMedia,
} from './types';

import theme, { IntentIcon } from '~/app/theme';
import { openCarousel } from '~/framework/components/carousel/openCarousel';
import { openMediaPlayer } from '~/framework/components/media/player/navigation';
import { openPDFReader } from '~/framework/components/pdf/pdf-reader';
import toast from '~/framework/components/toast';
import { AudienceParameter } from '~/framework/modules/audience/types';
import { openUrl } from '~/framework/util/linking';

interface MediaIntent<MediaType extends Media> {
  condition: (media: Media) => media is MediaType;
  exec?: (media: MediaType, audience?: AudienceParameter) => void;
  icon?: (media: MediaType) => IntentIcon | string;
}

const mediaIntents = [
  // Image
  {
    condition(media) {
      return isImageMedia(media) || (isAttachmentMedia(media) && mimeCompare(media.mime, 'image/*') === 0);
    },
    exec(media, audience) {
      openCarousel({ data: [{ ...media, src: toURISource(media.src), type: 'image' }], referer: audience, startIndex: 0 });
    },
    icon(_) {
      return theme.media.image;
    },
  } as MediaIntent<ImageMedia | AttachmentMedia>,

  // Video
  {
    condition(media) {
      return isVideoMedia(media) || (isAttachmentMedia(media) && mimeCompare(media.mime, 'video/*') === 0);
    },
    exec(media, audience) {
      openMediaPlayer({
        filetype: media.mime,
        referer: audience,
        source: toURISource(media.src),
        type: MediaType.VIDEO,
      });
    },
    icon(_) {
      return theme.media.video;
    },
  } as MediaIntent<VideoMedia | AttachmentMedia>,

  // Audio
  {
    condition: media => isAudioMedia(media) || (isAttachmentMedia(media) && mimeCompare(media.mime, 'audio/*') === 0),
    exec(media, audience) {
      openMediaPlayer({
        filetype: media.mime,
        referer: audience,
        source: toURISource(media.src),
        type: MediaType.AUDIO,
      });
    },
    icon(_) {
      return theme.media.audio;
    },
  } as MediaIntent<AudioMedia | AttachmentMedia>,

  // PDF
  {
    condition: media => /*isDocumentMedia(media) || */ isAttachmentMedia(media) && mimeCompare(media.mime, 'application/pdf') === 0,
    exec(media, _) {
      const source = toURISource(media.src);
      if (!source.uri) {
        toast.showError();
        return;
      }
      openPDFReader({
        src: source.uri!,
        title: media.name || '',
      });
    },
    icon(_) {
      return 'PDF';
    },
  } as MediaIntent</*DocumentMedia | */ AttachmentMedia>,

  // Embedded ("Iframes")
  {
    condition: media => isEmbeddedMedia(media),
    exec(media, audience) {
      openMediaPlayer({
        referer: audience,
        source: toURISource(media.src) as WebViewSourceUri,
        type: MediaType.EMBEDDED,
      });
    },
    icon(_) {
      return theme.media.embedded;
    },
  } as MediaIntent<EmbeddedMedia>,

  // External Link
  {
    condition: media => isLinkMedia(media),
    exec(media, _) {
      openUrl(toURISource(media.src).uri);
    },
    icon(_) {
      // const absoluteSrc = sessionURISource(toURISource(media.src));
      // const domainURL = absoluteSrc.uri ? new URL(absoluteSrc.uri) : undefined;
      // if (domainURL && domainURL.protocol.includes('http')) {
      //   return { source: sessionURISource(toURISource(`${domainURL.origin}/favicon.ico`)), type: 'Image' };
      // }
      return theme.media.link;
    },
  } as MediaIntent<LinkMedia>,

  // Unkncown file media
  {
    condition: media => isFileMedia(media),
    exec(media, _) {
      openUrl(toURISource(media.src).uri);
    },
    icon(media) {
      const extension = Mime.getExtension(media.mime);
      console.info('EXTENSIONS', media.type, extension);
      return extension?.toLocaleUpperCase() ?? theme.media.default;
    },
  } as MediaIntent<FileMedia>,
] as MediaIntent<FileMedia>[];

export const openMedia = (media: Media, audience?: AudienceParameter) => {
  for (const intent of mediaIntents) {
    if (intent.condition(media) && intent.exec) {
      intent.exec(media, audience);
      return;
    }
  }
  toast.showError();
};

export const getMediaIcon = (media: Media) => {
  for (const intent of mediaIntents) {
    if (intent.condition(media) && intent.icon) {
      return intent.icon(media);
    }
  }
  return theme.media.default;
};
