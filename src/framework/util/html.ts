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
  return sortedMedia;
};

// /**
//  * Extracts text from an input html string
//  * @param html
//  */
//  export const extractTextFromHtml = (html: string) => {
//   if (!html) return;
//   const plainTextRegex = />([^</]+)/g;
//   const foundTexts = [...html.matchAll(plainTextRegex)];
//   const test = foundTexts.map(foundText => foundText[1]);
//   console.log("newtest:foundTexts", foundTexts)
// }
