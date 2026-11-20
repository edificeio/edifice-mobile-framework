import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';

/** Icon of the chip naming the app. */
export const CHIP_ICON_SIZE = getScaleWidth(16);

/** The message comes as html, with the name of the sender in bold. */
export const MESSAGE_HTML_OPTIONS = {
  audio: false,
  globalTextStyle: { ...TextFontStyle.Regular, ...TextSizeStyle.Normal },
  hyperlinks: false,
  iframes: false,
  ignoreLineBreaks: true,
  images: false,
  // Size repeated: a link does not inherit the global style.
  linkTextStyle: { ...TextFontStyle.Bold, ...TextSizeStyle.Normal },
  textColor: false,
  textFormatting: false,
  video: false,
};

export const AVATAR_SIZE = UI_SIZES.elements.avatar.sm;

export const MOOD_SIZE = getScaleWidth(60);

export const USERBOOK_MOOD = 'USERBOOK_MOOD';
export const USERBOOK_MOTTO = 'USERBOOK_MOTTO';

/** Preview block shown by a notification that carries media. */
export const PREVIEW_ICON_SIZE = getScaleWidth(20);
export const PREVIEW_TITLE_LINES = 2;
export const PREVIEW_TEXT_LINES = 2;

/**
 * Where the name of the resource and its title are read, each app naming them its own way. The
 * first key present wins.
 *
 * The leading ones are those the payloads actually carry for the apps that send a preview — news,
 * blog and schoolbook are the only ones ever coming with media. The others are kept for the apps
 * that were not in reach when this was written.
 */
export const RESOURCE_NAME_PARAMS = ['resourceName', 'blogTitle', 'threadTitle', 'wallName', 'folderName'];
export const TITLE_PARAMS = ['info', 'postTitle', 'wordTitle', 'infoTitle', 'noteTitle', 'title'];
