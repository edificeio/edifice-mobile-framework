import deepmerge from 'deepmerge';
import deviceInfoModule from 'react-native-device-info';

import theme from '~/app/theme';
import { IAppBadgeInfo, IAppBadgesInfoDeclaration } from '~/framework/util/moduleTool';

// all badges have default values that can be overrided with their moduleConfig.

export let APPBADGES: {
  [key: string]: IAppBadgeInfo;
} = {
  ARCHIVE: { icon: { type: 'NamedSvg', name: 'archives' }, color: theme.themeOpenEnt.yellow },
  BLOG: { icon: { type: 'NamedSvg', name: 'blog' }, color: theme.themeOpenEnt.indigo },
  CALENDAR: { icon: { type: 'NamedSvg', name: 'calendar' }, color: theme.themeOpenEnt.yellow },
  COLLABORATIVEEDITOR: { icon: { type: 'NamedSvg', name: 'pad' }, color: theme.themeOpenEnt.cyan },
  COLLABORATIVEWALL: { icon: { type: 'NamedSvg', name: 'collaborativeWall' }, color: theme.themeOpenEnt.green },
  COMMUNITY: { icon: { type: 'NamedSvg', name: 'community' }, color: theme.themeOpenEnt.purple },
  EXERCIZER: { icon: { type: 'NamedSvg', name: 'exercices' }, color: theme.themeOpenEnt.purple },
  FORUM: { icon: { type: 'NamedSvg', name: 'forum' }, color: theme.themeOpenEnt.cyan },
  HOMEWORKS: { icon: { type: 'NamedSvg', name: 'homework2D' }, color: theme.themeOpenEnt.green },
  MESSAGERIE: { icon: { type: 'NamedSvg', name: 'messages' }, color: theme.themeOpenEnt.yellow },
  MINDMAP: { icon: { type: 'NamedSvg', name: 'siteMap' }, color: theme.themeOpenEnt.cyan },
  NEWS: { icon: { type: 'NamedSvg', name: 'newsFeed' }, color: theme.themeOpenEnt.cyan },
  PAGES: { icon: { type: 'NamedSvg', name: 'pages' }, color: theme.themeOpenEnt.red },
  POLL: { icon: { type: 'NamedSvg', name: 'poll' }, color: theme.themeOpenEnt.cyan },
  RACK: { icon: { type: 'NamedSvg', name: 'rack' }, color: theme.themeOpenEnt.red },
  RBS: { icon: { type: 'NamedSvg', name: 'rbs' }, color: theme.themeOpenEnt.pink },
  SCHOOLBOOK: { icon: { type: 'NamedSvg', name: 'homeLiaisonDiary' }, color: theme.themeOpenEnt.green },
  SCRAPBOOK: { icon: { type: 'NamedSvg', name: 'scrapbook' }, color: theme.themeOpenEnt.green },
  SHAREBIGFILES: { icon: { type: 'NamedSvg', name: 'shareBigFiles' }, color: theme.themeOpenEnt.purple },
  SUPPORT: { icon: { type: 'NamedSvg', name: 'support' }, color: theme.themeOpenEnt.green },
  TIMELINE: { icon: { type: 'NamedSvg', name: 'report' }, color: theme.themeOpenEnt.indigo },
  TIMELINEGENERATOR: { icon: { type: 'NamedSvg', name: 'timeLineGenerator' }, color: theme.themeOpenEnt.yellow },
  USERBOOK: { icon: { type: 'NamedSvg', name: 'adressBook' }, color: theme.themeOpenEnt.green },
  USERBOOK_MOOD: { icon: { type: 'NamedSvg', name: 'adressBook' }, color: theme.themeOpenEnt.green },
  USERBOOK_MOTTO: { icon: { type: 'NamedSvg', name: 'adressBook' }, color: theme.themeOpenEnt.green },
  WIKI: { icon: { type: 'NamedSvg', name: 'wiki' }, color: theme.themeOpenEnt.purple },
  WORKSPACE: { icon: { type: 'NamedSvg', name: 'files' }, color: theme.themeOpenEnt.red },
};

export const updateAppBadges = (badges: IAppBadgesInfoDeclaration) => {
  APPBADGES = deepmerge(APPBADGES, badges, {}) as typeof APPBADGES;
};
