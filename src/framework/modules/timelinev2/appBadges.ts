import { ColorValue } from "react-native";
import theme from "../../theme";

export const APPBADGES: {
  [key: string]: { icon: string; color: ColorValue; }
} = {
  "ARCHIVE": { icon: "file-archive", color: theme.themeOpenEnt.yellow },
  "BLOG": { icon: "bullhorn", color: theme.themeOpenEnt.indigo },
  "CALENDAR": { icon: "calendar", color: theme.themeOpenEnt.yellow },
  "COLLABORATIVEEDITOR": { icon: "pad1-1", color: theme.themeOpenEnt.cyan },
  "COLLABORATIVEWALL": { icon: "slideshare", color: theme.themeOpenEnt.green },
  "COMMUNITY": { icon: "share", color: theme.themeOpenEnt.purple },
  "EXERCIZER": { icon: "cubes", color: theme.themeOpenEnt.purple },
  "FORUM": { icon: "chat2", color: theme.themeOpenEnt.cyan },
  "HOMEWORKS": { icon: "book-alt", color: theme.themeOpenEnt.green },
  "MESSAGERIE": { icon: "mail", color: theme.themeOpenEnt.yellow },
  "MINDMAP": { icon: "sitemap", color: theme.themeOpenEnt.cyan },
  "NEWS": { icon: "newspaper", color: theme.themeOpenEnt.cyan },
  "PAGES": { icon: "website", color: theme.themeOpenEnt.red },
  "POLL": { icon: "check-1", color: theme.themeOpenEnt.cyan },
  "RACK": { icon: "inbox-1", color: theme.themeOpenEnt.red },
  "RBS": { icon: "reservation", color: theme.themeOpenEnt.pink },
  "SCHOOLBOOK": { icon: "chat3", color: theme.themeOpenEnt.green },
  "SCRAPBOOK": { icon: "scrapbook", color: theme.themeOpenEnt.green },
  "SHAREBIGFILES": { icon: "bigfiles", color: theme.themeOpenEnt.purple },
  "SUPPORT": { icon: "help-circled", color: theme.themeOpenEnt.green },
  "TIMELINE": { icon: "home", color: theme.themeOpenEnt.indigo },
  "TIMELINEGENERATOR": { icon: "flow-cascade", color: theme.themeOpenEnt.yellow },
  "USERBOOK": { icon: "address-book", color: theme.themeOpenEnt.green },
  "WIKI": { icon: "wikipedia", color: theme.themeOpenEnt.purple },
  "WORKSPACE": { icon: "folder", color: theme.themeOpenEnt.red }
}