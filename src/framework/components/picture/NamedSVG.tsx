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
  // ModuleIcons
  admin: import(`../../../../assets/icons/moduleIcons/admin.svg`),
  adressBook: import(`../../../../assets/icons/moduleIcons/adressBook.svg`),
  archives: import(`../../../../assets/icons/moduleIcons/archives.svg`),
  blog: import(`../../../../assets/icons/moduleIcons/blog.svg`),
  calendar: import(`../../../../assets/icons/moduleIcons/calendar.svg`),
  collaborativeWall: import(`../../../../assets/icons/moduleIcons/collaborativeWall.svg`),
  exercices: import(`../../../../assets/icons/moduleIcons/exercices.svg`),
  files: import(`../../../../assets/icons/moduleIcons/files.svg`),
  forum: import(`../../../../assets/icons/moduleIcons/forum.svg`),
  homeLiaisonDiary: import(`../../../../assets/icons/moduleIcons/homeLiaisonDiary.svg`),
  homework1D: import(`../../../../assets/icons/moduleIcons/homework1D.svg`),
  homework2D: import(`../../../../assets/icons/moduleIcons/homework2D.svg`),
  messages: import(`../../../../assets/icons/moduleIcons/messages.svg`),
  newsFeed: import(`../../../../assets/icons/moduleIcons/newsFeed.svg`),
  pad: import(`../../../../assets/icons/moduleIcons/pad.svg`),
  pages: import(`../../../../assets/icons/moduleIcons/pages.svg`),
  presences: import(`../../../../assets/icons/moduleIcons/presences.svg`),
  rack: import(`../../../../assets/icons/moduleIcons/rack.svg`),
  rbs: import(`../../../../assets/icons/moduleIcons/rbs.svg`),
  scrapbook: import(`../../../../assets/icons/moduleIcons/scrapbook.svg`),
  shareBigFiles: import(`../../../../assets/icons/moduleIcons/shareBigFiles.svg`),
  siteMap: import(`../../../../assets/icons/moduleIcons/siteMap.svg`),
  skills: import(`../../../../assets/icons/moduleIcons/skills.svg`),
  stats: import(`../../../../assets/icons/moduleIcons/stats.svg`),
  support: import(`../../../../assets/icons/moduleIcons/support.svg`),
  timeLineGenerator: import(`../../../../assets/icons/moduleIcons/timeLineGenerator.svg`),
  user: import(`../../../../assets/icons/moduleIcons/user.svg`),
  wiki: import(`../../../../assets/icons/moduleIcons/wiki.svg`),
  // Images
  'days-monday': import(`../../../../assets/images/days/monday.svg`),
  'days-tuesday': import(`../../../../assets/images/days/tuesday.svg`),
  'days-wednesday': import(`../../../../assets/images/days/wednesday.svg`),
  'days-thursday': import(`../../../../assets/images/days/thursday.svg`),
  'days-friday': import(`../../../../assets/images/days/friday.svg`),
  'days-saturday': import(`../../../../assets/images/days/saturday.svg`),
  'empty-blog': import(`../../../../assets/images/empty-screen/empty-blog.svg`),
  'empty-content': import(`../../../../assets/images/empty-screen/empty-content.svg`),
  'empty-conversation': import(`../../../../assets/images/empty-screen/empty-conversation.svg`),
  'empty-evaluations': import(`../../../../assets/images/empty-screen/empty-evaluations.svg`),
  'empty-hammock': import(`../../../../assets/images/empty-screen/empty-hammock.svg`),
  'empty-homework': import(`../../../../assets/images/empty-screen/empty-homework.svg`),
  'empty-light': import(`../../../../assets/images/empty-screen/empty-light.svg`),
  'empty-mediacentre': import(`../../../../assets/images/empty-screen/empty-mediacentre.svg`),
  'empty-schoolbook': import(`../../../../assets/images/empty-screen/empty-schoolbook.svg`),
  'empty-search': import(`../../../../assets/images/empty-screen/empty-search.svg`),
  'empty-timeline': import(`../../../../assets/images/empty-screen/empty-timeline.svg`),
  'empty-trash': import(`../../../../assets/images/empty-screen/empty-trash.svg`),
  'empty-viesco': import(`../../../../assets/images/empty-screen/empty-viesco.svg`),
  'empty-workspace': import(`../../../../assets/images/empty-screen/empty-workspace.svg`),
  'onboarding-0': import(`../../../../assets/images/onboarding/onboarding_0.svg`),
  'onboarding-1': import(`../../../../assets/images/onboarding/onboarding_1.svg`),
  'onboarding-2': import(`../../../../assets/images/onboarding/onboarding_2.svg`),
  'onboarding-3': import(`../../../../assets/images/onboarding/onboarding_3.svg`),
  'pictos-answer': import(`../../../../assets/images/pictos/answer.svg`),
  'pictos-external-link': import(`../../../../assets/images/pictos/external-link.svg`),
  'schoolbook-canteen': import(`../../../../assets/images/schoolbook/canteen.svg`),
  'schoolbook-event': import(`../../../../assets/images/schoolbook/event.svg`),
  'schoolbook-last-minute': import(`../../../../assets/images/schoolbook/last-minute.svg`),
  'schoolbook-leisure': import(`../../../../assets/images/schoolbook/leisure.svg`),
  'schoolbook-outing': import(`../../../../assets/images/schoolbook/outing.svg`),
  'schoolbook-various': import(`../../../../assets/images/schoolbook/various.svg`),
};

export interface NamedSVGProps extends SvgProps {
  name: string;
}

export const NamedSVG = ({ name, ...rest }: NamedSVGProps): JSX.Element | null => {
  const ImportedSVGRef = useRef<any>();
  const [loading, setLoading] = React.useState(false);
  useEffect((): void => {
    setLoading(true);
    const importSVG = async (): Promise<void> => {
      try {
        ImportedSVGRef.current = (await imports[name]).default;
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    };
    importSVG();
  }, [name]);
  if (!loading && ImportedSVGRef.current) {
    const { current: ImportedSVG } = ImportedSVGRef;
    return <ImportedSVG {...rest} />;
  }
  return null;
};

export default NamedSVG;
