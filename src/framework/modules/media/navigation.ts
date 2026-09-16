import { NavigationProp } from '@react-navigation/native';

import { NavigationRootParams } from '~/app/navigation/types';
import theme, { IntentIcon } from '~/app/theme';
import toast from '~/framework/components/toast';
import { AudienceParameter } from '~/framework/modules/audience/types';
import { openUrl } from '~/framework/util/linking';

import { mime, mimeCompare } from './mime';
import {
  AttachmentMedia,
  AudioMedia,
  EmbeddedMedia,
  FileMedia,
  ImageMedia,
  isAttachmentMedia,
  isAudioMedia,
  isEmbeddedMedia,
  isFileMedia,
  isImageMedia,
  isLinkMedia,
  isResourceMedia,
  isVideoMedia,
  LinkMedia,
  Media,
  ResourceMedia,
  VideoMedia,
} from './types';
import { toURISource } from './util';

interface MediaIntent<MediaType extends Media> {
  condition: (media: Media) => media is MediaType;
  exec?: (navigation: NavigationProp<NavigationRootParams>, media: MediaType, audience?: AudienceParameter) => void;
  icon?: (media: MediaType) => IntentIcon | string;
}

const mediaIntents = [
  // Image
  {
    condition(media) {
      return isImageMedia(media) || (isAttachmentMedia(media) && mimeCompare(media.mime, 'image/*') === 0);
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
    icon(_) {
      return theme.media.video;
    },
  } as MediaIntent<VideoMedia | AttachmentMedia>,

  // Audio
  {
    condition: media => isAudioMedia(media) || (isAttachmentMedia(media) && mimeCompare(media.mime, 'audio/*') === 0),
    icon(_) {
      return theme.media.audio;
    },
  } as MediaIntent<AudioMedia | AttachmentMedia>,

  // PDF
  {
    condition: media => /*isDocumentMedia(media) || */ isAttachmentMedia(media) && mimeCompare(media.mime, 'application/pdf') === 0,
    icon(_) {
      return 'PDF';
    },
  } as MediaIntent</*DocumentMedia | */ AttachmentMedia>,

  // Embedded ("Iframes")
  {
    condition: media => isEmbeddedMedia(media),
    exec(navigation, media, _) {
      const url = toURISource(media.src).uri;
      url && openUrl(url);
    },
    icon(_) {
      return theme.media.embedded;
    },
  } as MediaIntent<EmbeddedMedia>,

  // External Link
  {
    condition: media => isLinkMedia(media),
    exec(navigation, media, _) {
      const url = toURISource(media.src).uri;
      url && openUrl(url);
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

  // Resource
  {
    condition: media => isResourceMedia(media),
    exec(navigation, media, _) {
      // ToDo
    },
    icon(media) {
      return theme.media.embedded;
    },
  } as MediaIntent<ResourceMedia>,

  // Unkncown file media
  {
    condition: media => isFileMedia(media),
    icon(media) {
      const extension = mime.getExtension(media.mime);
      return extension?.toLocaleUpperCase() ?? theme.media.default;
    },
  } as MediaIntent<FileMedia>,
] as MediaIntent<FileMedia>[];

export const openMedia = (
  navigation: NavigationProp<NavigationRootParams>,
  media: Media[],
  index: number,
  audience?: AudienceParameter,
) => {
  const touchedMedia = media[index];
  if (!touchedMedia) {
    toast.showError();
    return;
  }

  // Any fileMedia opens the carousel
  if (isFileMedia(touchedMedia)) {
    const carouselMedia = media.filter(isFileMedia);
    const startIndex = carouselMedia.indexOf(touchedMedia);
    navigation.navigate('media/carousel', {
      media: carouselMedia,
      startIndex: startIndex !== -1 ? startIndex : 0,
    });
    return;
  }

  // iframes & links = openUrl
  for (const intent of mediaIntents) {
    if (intent.condition(touchedMedia) && intent.exec) {
      intent.exec(navigation, touchedMedia, audience);
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
