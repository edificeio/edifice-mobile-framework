import deepmerge from 'deepmerge';

import theme from '~/app/theme';
import appConf from '~/framework/util/appConf';
import { IAppBadgeInfo, IAppBadgesInfoDeclaration } from '~/framework/util/moduleTool';

// all badges have default values that can be overrided with their moduleConfig.

const variableColor = appConf.is1d ? theme.palette.primary.regular : theme.palette.complementary.green.regular;

export let APPBADGES: {
  [key: string]: IAppBadgeInfo;
} = {
  ARCHIVE: { color: theme.palette.complementary.yellow.regular, icon: { name: 'archives', type: 'NamedSvg' } },
  BLOG: { color: theme.palette.complementary.indigo.regular, icon: { name: 'blog', type: 'NamedSvg' } },
  CALENDAR: { color: theme.palette.complementary.yellow.regular, icon: { name: 'calendar', type: 'NamedSvg' } },
  COLLABORATIVEEDITOR: { color: theme.palette.complementary.blue.regular, icon: { name: 'pad', type: 'NamedSvg' } },
  COLLABORATIVEWALL: { color: theme.palette.complementary.green.regular, icon: { name: 'collaborativeWall', type: 'NamedSvg' } },
  COMMUNITY: { color: theme.palette.complementary.purple.regular, icon: { name: 'community', type: 'NamedSvg' } },
  EXERCIZER: { color: theme.palette.complementary.purple.regular, icon: { name: 'exercices', type: 'NamedSvg' } },
  FORMULAIRE: { color: theme.palette.complementary.purple.regular, icon: { name: 'form', type: 'NamedSvg' } },
  FORUM: { color: theme.palette.complementary.blue.regular, icon: { name: 'forum', type: 'NamedSvg' } },
  HOMEWORKS: { color: theme.palette.complementary.green.regular, icon: { name: 'homework1D', type: 'NamedSvg' } },
  MESSAGERIE: { color: theme.palette.complementary.yellow.regular, icon: { name: 'messages', type: 'NamedSvg' } },
  MINDMAP: { color: theme.palette.complementary.blue.regular, icon: { name: 'siteMap', type: 'NamedSvg' } },
  NEWS: { color: theme.palette.complementary.blue.regular, icon: { name: 'newsFeed', type: 'NamedSvg' } },
  PAGES: { color: theme.palette.complementary.red.regular, icon: { name: 'pages', type: 'NamedSvg' } },
  POLL: { color: theme.palette.complementary.blue.regular, icon: { name: 'poll', type: 'NamedSvg' } },
  PRESENCES: { color: theme.palette.complementary.yellow.regular, icon: { name: 'presences', type: 'NamedSvg' } },
  RACK: { color: theme.palette.complementary.red.regular, icon: { name: 'rack', type: 'NamedSvg' } },
  RBS: { color: theme.palette.complementary.pink.regular, icon: { name: 'rbs', type: 'NamedSvg' } },
  SCHOOLBOOK: { color: theme.palette.complementary.green.regular, icon: { name: 'homeLiaisonDiary', type: 'NamedSvg' } },
  SCRAPBOOK: { color: theme.palette.complementary.green.regular, icon: { name: 'scrapbook', type: 'NamedSvg' } },
  SHAREBIGFILES: { color: theme.palette.complementary.purple.regular, icon: { name: 'shareBigFiles', type: 'NamedSvg' } },
  SUPPORT: { color: theme.palette.complementary.green.regular, icon: { name: 'support', type: 'NamedSvg' } },
  TIMELINE: { color: theme.palette.complementary.indigo.regular, icon: { name: 'report', type: 'NamedSvg' } },
  TIMELINEGENERATOR: { color: theme.palette.complementary.yellow.regular, icon: { name: 'timeLineGenerator', type: 'NamedSvg' } },
  USERBOOK: { color: variableColor, icon: { name: 'adressBook', type: 'NamedSvg' } },
  USERBOOK_MOOD: { color: variableColor, icon: { name: 'adressBook', type: 'NamedSvg' } },
  USERBOOK_MOTTO: { color: variableColor, icon: { name: 'adressBook', type: 'NamedSvg' } },
  WIKI: { color: theme.palette.complementary.purple.regular, icon: { name: 'wiki', type: 'NamedSvg' } },
  WORKSPACE: { color: theme.palette.complementary.red.regular, icon: { name: 'files', type: 'NamedSvg' } },
};

export const updateAppBadges = (badges: IAppBadgesInfoDeclaration) => {
  APPBADGES = deepmerge(APPBADGES, badges, {}) as typeof APPBADGES;
};
