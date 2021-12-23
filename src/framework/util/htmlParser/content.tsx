import * as React from 'react';
import { decode } from 'html-entities';

import { IMedia } from "../notifications";
import { IRemoteAttachment } from '~/ui/Attachment';
import { AttachmentGroup } from '~/ui/AttachmentGroup';
import { IFrame } from '~/ui/IFrame';
import Images from '~/ui/Images';
import Player from '~/ui/Player';
import { signURISource, transformedSrc } from "~/infra/oauth";

/**
 * Extracts text from an input html string
 * @param html
 */
 export const extractTextFromHtml = (html: string) => {
  if (!html) return;
  const attachmentGroupRegex = /<div class="download-attachments">.*?<\/a><\/div><\/div>/g;
  const textWithoutAttachmentGroups = html.replaceAll(attachmentGroupRegex, "");
  const onlyText = textWithoutAttachmentGroups.replaceAll(/<(\/div|\/p|\/li|br|)>/g,"\n").replaceAll(/<.*?>/g,"");
  const unescaped = decode(onlyText);
  const trimmedToNull = unescaped === null ? null : unescaped.trim().length === 0 ? null : unescaped.trim();
  const trimmedToBlank = trimmedToNull !== null ? trimmedToNull : "";
  const formattedSpaces = trimmedToBlank.replaceAll(/\u200b/g,"").replaceAll(/[ ,\t]{2,}/g," ").replaceAll(/[\s]{2,}/g,"\n");

  return formattedSpaces;
}

/**
 * Extracts media from an input html string
 * @param html
 */
 export const extractMediaFromHtml = (html: string) => {
  if (!html) return;
  const imageRegex = /<img(\s+[^>]*)?\ssrc=\"([^\"]+)\"/g;
  const audioRegex = /<audio(\s+[^>]*)?\ssrc=\"([^\"]+)\"/g;
  const videoRegex = /<video(\s+[^>]*)?\ssrc=\"([^\"]+)\"/g;
  const iframeRegex = /<iframe(\s+[^>]*)?\ssrc=\"([^\"]+)\"/g;
  const attachmentGroupRegex = /<div class="download-attachments">.*?<\/a><\/div><\/div>/g;
  const attachmentRegex = /<a.*?>.*?<\/a>/g;

  const foundImages = [...html.matchAll(imageRegex)];
  const foundAudios = [...html.matchAll(audioRegex)];
  const foundVideos = [...html.matchAll(videoRegex)];
  const foundIframes = [...html.matchAll(iframeRegex)];
  const foundAttachmentGroups = [...html.matchAll(attachmentGroupRegex)];
  const foundAttachmentsByGroup = foundAttachmentGroups && foundAttachmentGroups.map(foundAttachmentGroup => ({ 
    index: foundAttachmentGroup.index,
    attachments: foundAttachmentGroup[0].match(attachmentRegex)
  }));

  const images = foundImages && foundImages.map(foundImage => ({ type: "image", src: foundImage[2], index: foundImage.index }));
  const audios = foundAudios && foundAudios.map(foundAudio => ({ type: "audio", src: foundAudio[2], index: foundAudio.index }));
  const videos = foundVideos && foundVideos.map(foundVideo => ({ type: "video", src: foundVideo[2], index: foundVideo.index }));
  const iframes = foundIframes && foundIframes.map(foundIframe => ({ type: "iframe", src: foundIframe[2], index: foundIframe.index }));
  let unflattenedAttachments = [];
  foundAttachmentsByGroup && foundAttachmentsByGroup.forEach(attGroup => {
    const formattedAtts = attGroup.attachments?.map(attHtml => {
      const attUrl = attHtml.match(/href="(.*?)"/g);
      const attDisplayName = attHtml.match(/<\/div>.*?<\/a>/g);
      return {
        type: "attachment",
        src: attUrl && `${attUrl[0].replace('href="', '').replace('"', '')}`,
        name: attDisplayName && attDisplayName[0].replace(/<\/div>/g, '').replace(/<\/a>/g, ''),
        index: attGroup.index,
      };
    });
    unflattenedAttachments.push(formattedAtts);
  });
  const attachments = unflattenedAttachments.flat();

  const sortedMedia = images.concat(audios, videos, iframes, attachments).sort((a,b) => a.index - b.index);
  const sortedMediaWithoutIndex = sortedMedia.map(({index, ...mediaWithoutIndex}) => mediaWithoutIndex);

  return sortedMediaWithoutIndex;
};

const renderAttachementsPreview = (medias: IMedia[]) => {
  let mediaAttachments: IMedia[] = [];
  for (const mediaItem of medias) {
    if (mediaAttachments.length === 4 || mediaItem.type !== 'attachment') break;
    mediaAttachments.push(mediaItem);
  }
  const attachments = mediaAttachments.map(mediaAtt => ({
    url: transformedSrc(mediaAtt.src as string),
    displayName: mediaAtt.name,
  }));
  return <AttachmentGroup attachments={attachments as Array<IRemoteAttachment>} containerStyle={{ flex: 1 }} />;
}

const renderAudioVideoPreview = (media: IMedia) => {
  return (
    <Player
      type={media.type}
      source={signURISource(transformedSrc(media.src as string))}
      // TODO: add posterSource and ratio (when backend ready)
      // posterSource={media.posterSource ? signURISource(transformedSrc(media.posterSource as string)) : undefined}
      // ratio={media.ratio}
    />
  );
};

const renderIframePreview = (media: IMedia) => {
  return <IFrame source={media.src as string} />;
};

const renderImagesPreview = (medias: IMedia[]) => {
  let images: IMedia[] = [];
  for (const mediaItem of medias) {
    if (mediaItem.type !== 'image') break;
    images.push(mediaItem);
  }
  const imageSrcs = images.map((image, index) => ({ 
    src: signURISource(transformedSrc(image.src as string)),
    alt: `image-${index}`
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
}
