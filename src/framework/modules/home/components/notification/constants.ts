import { THEME_LEVEL, ThemeLevel } from '~/app/theme';
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

export const THEME_DEGREE: { [Level in ThemeLevel]: Lowercase<Level> } = {
  [THEME_LEVEL.FIRST_DEGREE]: '1d',
  [THEME_LEVEL.SECOND_DEGREE]: '2d',
};

/** Preview block shown by a notification that carries media. */
export const PREVIEW_ICON_SIZE = getScaleWidth(20);
export const PREVIEW_TITLE_LINES = 2;
export const PREVIEW_TEXT_LINES = 2;

/**
 * Where the name of the resource and the title are read. Each app names them its own way — a blog
 * sends `blogTitle` and `postTitle` ,so the first key present wins. `resourceName` comes first,
 * it is the only one the adapter itself sets.
 */
export const RESOURCE_NAME_PARAMS = ['resourceName', 'blogTitle', 'threadTitle', 'wallName', 'folderName'];
export const TITLE_PARAMS = ['postTitle', 'info', 'infoTitle', 'noteTitle', 'title'];
