import deepmerge from 'deepmerge';

import theme from '~/app/theme';
import appConf from '~/framework/util/appConf';
import { IAppBadgeInfo, IAppBadgesInfoDeclaration } from '~/framework/util/moduleTool';

// all badges have default values that can be overrided with their moduleConfig.

const variableColor = appConf.is1d ? theme.palette.primary.regular : theme.palette.complementary.green.regular;

export let APPBADGES: {
  [key: string]: IAppBadgeInfo;
} = {
  ARCHIVE: { icon: { type: 'NamedSvg', name: 'archives' }, color: theme.palette.complementary.yellow.regular },
  BLOG: { icon: { type: 'NamedSvg', name: 'blog' }, color: theme.palette.complementary.indigo.regular },
  CALENDAR: { icon: { type: 'NamedSvg', name: 'calendar' }, color: theme.palette.complementary.yellow.regular },
  COLLABORATIVEEDITOR: { icon: { type: 'NamedSvg', name: 'pad' }, color: theme.palette.complementary.blue.regular },
  COLLABORATIVEWALL: { icon: { type: 'NamedSvg', name: 'collaborativeWall' }, color: theme.palette.complementary.green.regular },
  COMMUNITY: { icon: { type: 'NamedSvg', name: 'community' }, color: theme.palette.complementary.purple.regular },
  EXERCIZER: { icon: { type: 'NamedSvg', name: 'exercices' }, color: theme.palette.complementary.purple.regular },
  FORMULAIRE: { icon: { type: 'NamedSvg', name: 'form' }, color: theme.palette.complementary.purple.regular },
  FORUM: { icon: { type: 'NamedSvg', name: 'forum' }, color: theme.palette.complementary.blue.regular },
  HOMEWORKS: { icon: { type: 'NamedSvg', name: 'homework1D' }, color: theme.palette.complementary.green.regular },
  MESSAGERIE: { icon: { type: 'NamedSvg', name: 'messages' }, color: theme.palette.complementary.yellow.regular },
  MINDMAP: { icon: { type: 'NamedSvg', name: 'siteMap' }, color: theme.palette.complementary.blue.regular },
  NEWS: { icon: { type: 'NamedSvg', name: 'newsFeed' }, color: theme.palette.complementary.blue.regular },
  PAGES: { icon: { type: 'NamedSvg', name: 'pages' }, color: theme.palette.complementary.red.regular },
  POLL: { icon: { type: 'NamedSvg', name: 'poll' }, color: theme.palette.complementary.blue.regular },
  RACK: { icon: { type: 'NamedSvg', name: 'rack' }, color: theme.palette.complementary.red.regular },
  RBS: { icon: { type: 'NamedSvg', name: 'rbs' }, color: theme.palette.complementary.pink.regular },
  SCHOOLBOOK: { icon: { type: 'NamedSvg', name: 'homeLiaisonDiary' }, color: theme.palette.complementary.green.regular },
  SCRAPBOOK: { icon: { type: 'NamedSvg', name: 'scrapbook' }, color: theme.palette.complementary.green.regular },
  SHAREBIGFILES: { icon: { type: 'NamedSvg', name: 'shareBigFiles' }, color: theme.palette.complementary.purple.regular },
  SUPPORT: { icon: { type: 'NamedSvg', name: 'support' }, color: theme.palette.complementary.green.regular },
  TIMELINE: { icon: { type: 'NamedSvg', name: 'report' }, color: theme.palette.complementary.indigo.regular },
  TIMELINEGENERATOR: { icon: { type: 'NamedSvg', name: 'timeLineGenerator' }, color: theme.palette.complementary.yellow.regular },
  USERBOOK: { icon: { type: 'NamedSvg', name: 'adressBook' }, color: variableColor },
  USERBOOK_MOOD: { icon: { type: 'NamedSvg', name: 'adressBook' }, color: variableColor },
  USERBOOK_MOTTO: { icon: { type: 'NamedSvg', name: 'adressBook' }, color: variableColor },
  WIKI: { icon: { type: 'NamedSvg', name: 'wiki' }, color: theme.palette.complementary.purple.regular },
  WORKSPACE: { icon: { type: 'NamedSvg', name: 'files' }, color: theme.palette.complementary.red.regular },
};

export const updateAppBadges = (badges: IAppBadgesInfoDeclaration) => {
  APPBADGES = deepmerge(APPBADGES, badges, {}) as typeof APPBADGES;
};
