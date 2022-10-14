import { decode } from 'html-entities';
import I18n from 'i18n-js';
import * as React from 'react';
import theme from '~/app/theme';

import { IMedia } from '~/framework//util/notifications';
import { UI_SIZES } from '~/framework/components/constants';
import { TextItalic } from '~/framework/components/text';
import { computeVideoThumbnail } from '~/framework/modules/workspace/service';
import { signURISource, transformedSrc } from '~/infra/oauth';
import { IRemoteAttachment } from '~/ui/Attachment';
import { AttachmentGroup } from '~/ui/AttachmentGroup';
import { IFrame } from '~/ui/IFrame';
import Images from '~/ui/Images';
import Player from '~/ui/Player';

/**
 * Extracts text from an input html string
 * @param html
 */
export const extractTextFromHtml = (html: string) => {
  if (!html) return;
  const attachmentGroupRegex = /<div class="download-attachments">.*?<\/a><\/div><\/div>/g;
  const textWithoutAttachmentGroups = html.replaceAll(attachmentGroupRegex, '');
  const onlyText = textWithoutAttachmentGroups.replaceAll(/<(\/div|\/p|\/li|br|)>/g, '\n').replaceAll(/<.*?>/g, '');
  const unescaped = decode(onlyText);
  const trimmedToNull = unescaped === null ? null : unescaped.trim().length === 0 ? null : unescaped.trim();
  const trimmedToBlank = trimmedToNull !== null ? trimmedToNull : '';
  const formattedSpaces = trimmedToBlank
    .replaceAll(/\u200b/g, '') // Remove ZWSP
    .replaceAll(/^\s+|\s+$/g, '') // Trim blank from start and end
    .replaceAll(/\s+/g, ' '); // Compact spaces & new lines

  return formattedSpaces;
};

/**
 * Extracts media from an input html string
 * @param html
 */
export const extractMediaFromHtml = (html: string) => {
  if (!html) return;
  const imageRegex = /<img(\s+[^>]*)?\ssrc=\"([^\"]+)\"/g;
  const audioRegex = /<audio(\s+[^>]*)?\ssrc=\"([^\"]+)\"/g;
  const videoRegex = /<video(\s+[^>]*)>/g;
  const tagAttributesPattern = /(data-)?([^= ]+)=\"([^\"]*)\"/g;
  const iframeRegex = /<iframe(\s+[^>]*)?\ssrc=\"([^\"]+)\"/g;
  const attachmentGroupRegex = /<div class="download-attachments">.*?<\/a><\/div><\/div>/g;
  const attachmentRegex = /<a.*?>.*?<\/a>/g;

  const foundImages = [...html.matchAll(imageRegex)];
  const foundAudios = [...html.matchAll(audioRegex)];
  const foundVideos = [...html.matchAll(videoRegex)];
  const foundIframes = [...html.matchAll(iframeRegex)];
  const foundAttachmentGroups = [...html.matchAll(attachmentGroupRegex)];
  const foundAttachmentsByGroup =
    foundAttachmentGroups &&
    foundAttachmentGroups.map(foundAttachmentGroup => ({
      index: foundAttachmentGroup.index,
      attachments: foundAttachmentGroup[0].match(attachmentRegex),
    }));

  const unsortedMedia = [] as { index: number; type: string; src: string }[];

  foundImages &&
    foundImages.forEach(foundImage => {
      unsortedMedia.push({ type: 'image', src: foundImage[2], index: foundImage.index || 0 });
    });
  foundAudios &&
    foundAudios.forEach(foundAudio => {
      unsortedMedia.push({ type: 'audio', src: foundAudio[2], index: foundAudio.index || 0 });
    });
  foundVideos &&
    foundVideos.forEach(foundVideo => {
      const videoAttrs = [...foundVideo[1].matchAll(tagAttributesPattern)];
      unsortedMedia.push({
        type: 'video',
        src: foundVideo[2],
        index: foundVideo.index || 0,
        ...Object.fromEntries(videoAttrs.map(attr => attr.slice(2))),
      });
    });
  foundIframes &&
    foundIframes.forEach(foundIframe => {
      unsortedMedia.push({ type: 'iframe', src: foundIframe[2], index: foundIframe.index || 0 });
    });

  const unflattenedAttachments = [] as { index: number; type: string; src: string; name: string }[];
  foundAttachmentsByGroup &&
    foundAttachmentsByGroup.forEach(attGroup => {
      for (const attHtml of attGroup.attachments || []) {
        const attUrl = attHtml.match(/href="(.*?)"/g);
        const attDisplayName = attHtml.match(/<\/div>.*?<\/a>/g);
        attUrl &&
          attDisplayName &&
          unflattenedAttachments.push({
            type: 'attachment',
            src: attUrl && `${attUrl[0].replace('href="', '').replace('"', '')}`,
            name: attDisplayName && attDisplayName[0].replace(/<\/div>/g, '').replace(/<\/a>/g, ''),
            index: attGroup.index || 0,
          });
      }
    });
  unsortedMedia.push(...unflattenedAttachments.flat());

  return unsortedMedia.sort((a, b) => a.index - b.index);
};

const renderAttachementsPreview = (medias: IMedia[]) => {
  const mediaAttachments: IMedia[] = [];
  for (const mediaItem of medias) {
    if (mediaAttachments.length === 4 || mediaItem.type !== 'attachment') break;
    mediaAttachments.push(mediaItem);
  }
  const attachments = mediaAttachments.map(mediaAtt => ({
    url: transformedSrc(mediaAtt.src as string),
    displayName: mediaAtt.name,
  }));
  return <AttachmentGroup attachments={attachments as IRemoteAttachment[]} containerStyle={{ flex: 1 }} />;
};

export const extractVideoResolution = (resolutionAsString: string) => {
  const match = resolutionAsString ? /^(\d+)x(\d+)$/.exec(resolutionAsString) : undefined;
  return match ? [parseInt(match[1]), parseInt(match[2])] : undefined;
};

const renderAudioVideoPreview = (media: IMedia) => {
  const videoDimensions = media['video-resolution'] ? extractVideoResolution(media['video-resolution']) : undefined;
  const videoId = media['document-id'] as string | undefined;
  if (!media.src) {
    return <TextItalic style={{ backgroundColor: theme.palette.grey.cloudy, width: '100%', padding: UI_SIZES.spacing.small }}>{I18n.t(`${media.type || 'media'}NotAvailable`)}</TextItalic>
  }
  return (
    <Player
      type={media.type as 'audio' | 'video'}
      source={signURISource(transformedSrc(media.src as string))}
      posterSource={videoId && videoDimensions ? signURISource(computeVideoThumbnail(videoId, videoDimensions)) : undefined}
      ratio={videoDimensions && videoDimensions[1] !== 0 ? videoDimensions[0] / videoDimensions[1] : undefined}
    />
  );
};

const renderIframePreview = (media: IMedia) => {
  return <IFrame source={media.src as string} />;
};

const renderImagesPreview = (medias: IMedia[]) => {
  const images: IMedia[] = [];
  for (const mediaItem of medias) {
    if (mediaItem.type !== 'image') break;
    images.push(mediaItem);
  }
  const imageSrcs = images.map((image, index) => ({
    src: signURISource(transformedSrc(image.src as string)),
    alt: `image-${index}`,
  }));
  return <Images images={imageSrcs} />;
};

/**
 * Renders first medias from an input media array
 * @param medias
 */
export const renderMediaPreview = (medias: IMedia[]) => {
  const firstMedia = medias && medias[0];
  const components = {
    attachment: () => renderAttachementsPreview(medias),
    audio: () => renderAudioVideoPreview(firstMedia),
    iframe: () => renderIframePreview(firstMedia),
    image: () => renderImagesPreview(medias),
    video: () => renderAudioVideoPreview(firstMedia),
  };
  return firstMedia && components[firstMedia.type]?.();
};
