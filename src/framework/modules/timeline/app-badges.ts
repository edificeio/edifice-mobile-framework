import deepmerge from 'deepmerge';

import theme from '~/app/theme';
import { IAppBadgeInfo, IAppBadgesInfoDeclaration } from '~/framework/util/moduleTool';

// all badges have default values that can be overrided with their moduleConfig.

export let APPBADGES: {
  [key: string]: IAppBadgeInfo;
} = {
  APPOINTMENTS: { color: theme.apps.appointments.accentColors.regular, icon: theme.apps.appointments.icon },
  ARCHIVE: { color: theme.apps.archive.accentColors.regular, icon: theme.apps.archive.icon },
  BLOG: { color: theme.apps.blog.accentColors.regular, icon: theme.apps.blog.icon },
  CALENDAR: { color: theme.apps.calendar.accentColors.regular, icon: theme.apps.calendar.icon },
  COLLABORATIVEEDITOR: { color: theme.apps.collaborativeeditor.accentColors.regular, icon: theme.apps.collaborativeeditor.icon },
  COLLABORATIVEWALL: { color: theme.apps.collaborativewall.accentColors.regular, icon: theme.apps.collaborativewall.icon },
  COMMUNITY: { color: theme.apps.community.accentColors.regular, icon: theme.apps.community.icon },
  EXERCIZER: { color: theme.apps.exercizer.accentColors.regular, icon: theme.apps.exercizer.icon },
  FORMULAIRE: { color: theme.apps.formulaire.accentColors.regular, icon: theme.apps.formulaire.icon },
  FORUM: { color: theme.apps.forum.accentColors.regular, icon: theme.apps.forum.icon },
  HOMEWORKS: { color: theme.apps.homeworks.accentColors.regular, icon: theme.apps.homeworks.icon },
  MAGNETO: { color: theme.apps.magneto.accentColors.regular, icon: theme.apps.magneto.icon },
  MESSAGERIE: { color: theme.apps.conversation.accentColors.regular, icon: theme.apps.conversation.icon },
  MINDMAP: { color: theme.apps.mindmap.accentColors.regular, icon: theme.apps.mindmap.icon },
  NEWS: { color: theme.apps.news.accentColors.regular, icon: theme.apps.news.icon },
  PAGES: { color: theme.apps.pages.accentColors.regular, icon: theme.apps.pages.icon },
  POLL: { color: theme.apps.poll.accentColors.regular, icon: theme.apps.poll.icon },
  PRESENCES: { color: theme.apps.presences.accentColors.regular, icon: theme.apps.presences.icon },
  RACK: { color: theme.apps.rack.accentColors.regular, icon: theme.apps.rack.icon },
  RBS: { color: theme.apps.rbs.accentColors.regular, icon: theme.apps.rbs.icon },
  SCHOOLBOOK: { color: theme.apps.schoolbook.accentColors.regular, icon: theme.apps.schoolbook.icon },
  SCRAPBOOK: { color: theme.apps.scrapbook.accentColors.regular, icon: theme.apps.scrapbook.icon },
  SHAREBIGFILES: { color: theme.apps.sharebigfiles.accentColors.regular, icon: theme.apps.sharebigfiles.icon },
  SUPPORT: { color: theme.apps.support.accentColors.regular, icon: theme.apps.support.icon },
  TIMELINE: { color: theme.apps.timeline.accentColors.regular, icon: theme.apps.timeline.icon },
  TIMELINEGENERATOR: { color: theme.apps.timelinegenerator.accentColors.regular, icon: theme.apps.timelinegenerator.icon },
  USERBOOK: { color: theme.apps.userbook.accentColors.regular, icon: theme.apps.userbook.icon },
  USERBOOK_MOOD: { color: theme.apps.userbook.accentColors.regular, icon: theme.apps.userbook.icon },
  USERBOOK_MOTTO: { color: theme.apps.userbook.accentColors.regular, icon: theme.apps.userbook.icon },
  WIKI: { color: theme.apps.wiki.accentColors.regular, icon: theme.apps.wiki.icon },
  WORKSPACE: { color: theme.apps.workspace.accentColors.regular, icon: theme.apps.workspace.icon },
};

export const updateAppBadges = (badges: IAppBadgesInfoDeclaration) => {
  APPBADGES = deepmerge(APPBADGES, badges, {}) as typeof APPBADGES;
};
