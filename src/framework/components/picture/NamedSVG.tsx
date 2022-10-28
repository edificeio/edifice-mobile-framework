/**
 * NamedSVG
 *
 * Display a SVG file from its name.
 *
 * To add a SVG in the app, beware add its path to the "imports" list below.
 * ToDo : make this list automatically computed.
 */
import React, { useEffect, useRef } from 'react';
import { SvgProps } from 'react-native-svg';

const imports = {
  // Platform logos
  'logo-moncollege': import('ASSETS/platforms/logo-moncollege.svg'),
  'logo-monecole': import('ASSETS/platforms/logo-monecole.svg'),
  'logo-porto-vecchio': import('ASSETS/platforms/logo-porto-vecchio.svg'),
  // UI Icons
  'ui-answer': import('ASSETS/icons/uiIcons/answer.svg'),
  'ui-arrowDown': import('ASSETS/icons/uiIcons/arrowDown.svg'),
  'ui-arrowLeft': import('ASSETS/icons/uiIcons/arrowLeft.svg'),
  'ui-arrowRight': import('ASSETS/icons/uiIcons/arrowRight.svg'),
  'ui-arrowUp': import('ASSETS/icons/uiIcons/arrowUp.svg'),
  'ui-calendar': import('ASSETS/icons/uiIcons/calendar.svg'),
  'ui-close': import('ASSETS/icons/uiIcons/close.svg'),
  'ui-externalLink': import('ASSETS/icons/uiIcons/externalLink.svg'),
  'ui-flag': import('ASSETS/icons/uiIcons/flag.svg'),
  'ui-options': import('ASSETS/icons/uiIcons/options.svg'),
  'ui-rafterDown': import('ASSETS/icons/uiIcons/rafterDown.svg'),
  'ui-rafterLeft': import('ASSETS/icons/uiIcons/rafterLeft.svg'),
  'ui-rafterRight': import('ASSETS/icons/uiIcons/rafterRight.svg'),
  'ui-rafterUp': import('ASSETS/icons/uiIcons/rafterUp.svg'),
  'ui-save': import('ASSETS/icons/uiIcons/save.svg'),
  'ui-send': import('ASSETS/icons/uiIcons/send.svg'),
  'ui-skills': import('ASSETS/icons/uiIcons/skills.svg'),
  'ui-success': import('ASSETS/icons/uiIcons/success.svg'),
  'ui-users': import('ASSETS/icons/uiIcons/users.svg'),
  'ui-warning': import('ASSETS/icons/uiIcons/warning.svg'),
  'ui-eye': import('ASSETS/icons/uiIcons/eye.svg'),
  'ui-eyeSlash': import('ASSETS/icons/uiIcons/eyeSlash.svg'),
  'ui-trash': import('ASSETS/icons/uiIcons/trash.svg'),
  'ui-unarchive': import('ASSETS/icons/uiIcons/unarchive.svg'),
  // ModuleIcons
  admin: import('ASSETS/icons/moduleIcons/admin.svg'),
  adressBook: import('ASSETS/icons/moduleIcons/adressBook.svg'),
  archives: import('ASSETS/icons/moduleIcons/archives.svg'),
  blog: import('ASSETS/icons/moduleIcons/blog.svg'),
  calendar: import('ASSETS/icons/moduleIcons/calendar.svg'),
  collaborativeWall: import('ASSETS/icons/moduleIcons/collaborativeWall.svg'),
  community: import('ASSETS/icons/moduleIcons/community.svg'),
  competences: import('ASSETS/icons/moduleIcons/competences.svg'),
  diary: import('ASSETS/icons/moduleIcons/diary.svg'),
  edt: import('ASSETS/icons/moduleIcons/edt.svg'),
  exercices: import('ASSETS/icons/moduleIcons/exercices.svg'),
  files: import('ASSETS/icons/moduleIcons/files.svg'),
  forum: import('ASSETS/icons/moduleIcons/forum.svg'),
  homeLiaisonDiary: import('ASSETS/icons/moduleIcons/homeLiaisonDiary.svg'),
  homework1D: import('ASSETS/icons/moduleIcons/homework1D.svg'),
  homework2D: import('ASSETS/icons/moduleIcons/homework2D.svg'),
  mediacentre: import('ASSETS/icons/moduleIcons/mediacentre.svg'),
  messages: import('ASSETS/icons/moduleIcons/messages.svg'),
  newsFeed: import('ASSETS/icons/moduleIcons/newsFeed.svg'),
  pad: import('ASSETS/icons/moduleIcons/pad.svg'),
  pages: import('ASSETS/icons/moduleIcons/pages.svg'),
  poll: import('ASSETS/icons/moduleIcons/poll.svg'),
  presences: import('ASSETS/icons/moduleIcons/presences.svg'),
  rack: import('ASSETS/icons/moduleIcons/rack.svg'),
  rbs: import('ASSETS/icons/moduleIcons/rbs.svg'),
  report: import('ASSETS/icons/moduleIcons/report.svg'),
  scrapbook: import('ASSETS/icons/moduleIcons/scrapbook.svg'),
  shareBigFiles: import('ASSETS/icons/moduleIcons/shareBigFiles.svg'),
  siteMap: import('ASSETS/icons/moduleIcons/siteMap.svg'),
  skills: import('ASSETS/icons/moduleIcons/skills.svg'),
  stats: import('ASSETS/icons/moduleIcons/stats.svg'),
  support: import('ASSETS/icons/moduleIcons/support.svg'),
  timeLineGenerator: import('ASSETS/icons/moduleIcons/timeLineGenerator.svg'),
  user: import('ASSETS/icons/moduleIcons/user.svg'),
  wiki: import('ASSETS/icons/moduleIcons/wiki.svg'),
  // Images
  'days-monday': import('ASSETS/images/days/monday.svg'),
  'days-tuesday': import('ASSETS/images/days/tuesday.svg'),
  'days-wednesday': import('ASSETS/images/days/wednesday.svg'),
  'days-thursday': import('ASSETS/images/days/thursday.svg'),
  'days-friday': import('ASSETS/images/days/friday.svg'),
  'days-saturday': import('ASSETS/images/days/saturday.svg'),
  'empty-absences': import('ASSETS/images/empty-screen/empty-absences.svg'),
  'empty-blog': import('ASSETS/images/empty-screen/empty-blog.svg'),
  'empty-content': import('ASSETS/images/empty-screen/empty-content.svg'),
  'empty-conversation': import('ASSETS/images/empty-screen/empty-conversation.svg'),
  'empty-eula': import('ASSETS/images/empty-screen/empty-eula.svg'),
  'empty-evaluations': import('ASSETS/images/empty-screen/empty-evaluations.svg'),
  'empty-hammock': import('ASSETS/images/empty-screen/empty-hammock.svg'),
  'empty-homework': import('ASSETS/images/empty-screen/empty-homework.svg'),
  'empty-light': import('ASSETS/images/empty-screen/empty-light.svg'),
  'empty-mediacentre': import('ASSETS/images/empty-screen/empty-mediacentre.svg'),
  'empty-schoolbook': import('ASSETS/images/empty-screen/empty-schoolbook.svg'),
  'empty-search': import('ASSETS/images/empty-screen/empty-search.svg'),
  'empty-support': import('ASSETS/images/empty-screen/empty-support.svg'),
  'empty-timeline': import('ASSETS/images/empty-screen/empty-timeline.svg'),
  'empty-trash': import('ASSETS/images/empty-screen/empty-trash.svg'),
  'empty-viesco': import('ASSETS/images/empty-screen/empty-viesco.svg'),
  'empty-workspace': import('ASSETS/images/empty-screen/empty-workspace.svg'),
  'empty-pronote-uri': import('ASSETS/images/empty-screen/pronote-error-uri.svg'),
  'onboarding-0': import('ASSETS/images/onboarding/onboarding_0.svg'),
  'onboarding-1': import('ASSETS/images/onboarding/onboarding_1.svg'),
  'onboarding-2': import('ASSETS/images/onboarding/onboarding_2.svg'),
  'onboarding-3': import('ASSETS/images/onboarding/onboarding_3.svg'),
  'pictos-answer': import('ASSETS/images/pictos/answer.svg'),
  'pictos-arrow-right': import('ASSETS/images/pictos/arrow-right.svg'),
  'pictos-close': import('ASSETS/images/pictos/close.svg'),
  'pictos-external-link': import('ASSETS/images/pictos/external-link.svg'),
  'pictos-save': import('ASSETS/images/pictos/save.svg'),
  'pictos-send': import('ASSETS/images/pictos/send.svg'),
  'schoolbook-canteen': import('ASSETS/images/schoolbook/canteen.svg'),
  'schoolbook-event': import('ASSETS/images/schoolbook/event.svg'),
  'schoolbook-last-minute': import('ASSETS/images/schoolbook/last-minute.svg'),
  'schoolbook-leisure': import('ASSETS/images/schoolbook/leisure.svg'),
  'schoolbook-outing': import('ASSETS/images/schoolbook/outing.svg'),
  'schoolbook-various': import('ASSETS/images/schoolbook/various.svg'),
  'textbook-default': import('ASSETS/images/textbook-default.svg'),
};

let importsCache = {};

export const removeFromCache = (name: string) => {
  delete importsCache[name];
};

export const clearCache = () => {
  importsCache = {};
};

export interface NamedSVGProps extends SvgProps {
  name: string;
  cached?: boolean;
}

export const NamedSVG = ({ name, cached, ...rest }: NamedSVGProps): JSX.Element | null => {
  const ImportedSVGRef = useRef<any>(importsCache[name]);
  const [loading, setLoading] = React.useState(false);
  useEffect((): void => {
    if (!importsCache[name]) {
      // We use the cached item even if props.cached === false, if it has already been cached in another context.
      setLoading(true);
      const importSVG = async (): Promise<void> => {
        try {
          ImportedSVGRef.current = (await imports[name]).default;
          if (cached) {
            importsCache[name] = ImportedSVGRef.current;
          }
        } catch (err) {
          throw err;
        } finally {
          setLoading(false);
        }
      };
      importSVG();
    }
  }, [name]);
  if (!loading && ImportedSVGRef.current) {
    const { current: ImportedSVG } = ImportedSVGRef;
    return <ImportedSVG {...rest} />;
  }
  return null;
};

export default NamedSVG;
