import { THEME_LEVEL, ThemeLevel } from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';
import { renderMoodPicture } from '~/framework/modules/user/screens/profile/edit-moodmotto';

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

type Degree = (typeof THEME_DEGREE)[ThemeLevel];

export type MoodName = keyof (typeof renderMoodPicture)[keyof typeof renderMoodPicture];

export const MOOD_I18N_KEYS = {
  angry: { '1d': 'timeline-notiftype-mood-angry-1d', '2d': 'timeline-notiftype-mood-angry-2d' },
  default: { '1d': 'timeline-notiftype-mood-default-1d', '2d': 'timeline-notiftype-mood-default-2d' },
  dreamy: { '1d': 'timeline-notiftype-mood-dreamy-1d', '2d': 'timeline-notiftype-mood-dreamy-2d' },
  happy: { '1d': 'timeline-notiftype-mood-happy-1d', '2d': 'timeline-notiftype-mood-happy-2d' },
  joker: { '1d': 'timeline-notiftype-mood-joker-1d', '2d': 'timeline-notiftype-mood-joker-2d' },
  love: { '1d': 'timeline-notiftype-mood-love-1d', '2d': 'timeline-notiftype-mood-love-2d' },
  proud: { '1d': 'timeline-notiftype-mood-proud-1d', '2d': 'timeline-notiftype-mood-proud-2d' },
  sad: { '1d': 'timeline-notiftype-mood-sad-1d', '2d': 'timeline-notiftype-mood-sad-2d' },
  sick: { '1d': 'timeline-notiftype-mood-sick-1d', '2d': 'timeline-notiftype-mood-sick-2d' },
  tired: { '1d': 'timeline-notiftype-mood-tired-1d', '2d': 'timeline-notiftype-mood-tired-2d' },
  worried: { '1d': 'timeline-notiftype-mood-worried-1d', '2d': 'timeline-notiftype-mood-worried-2d' },
} satisfies Record<MoodName, Record<Degree, string>>;

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
