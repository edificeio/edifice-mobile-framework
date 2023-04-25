/**
 * NamedSVG
 *
 * Display a SVG file from its name.
 *
 * To add a SVG in the app, beware add its path to the "imports" list below.
 * ToDo : make this list automatically computed.
 */
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { SvgProps } from 'react-native-svg';

const imports = {
  // Platform logos
  'logo-moncollege': import('ASSETS/platforms/logo-moncollege.svg'),
  'logo-monecole': import('ASSETS/platforms/logo-monecole.svg'),
  'logo-porto-vecchio': import('ASSETS/platforms/logo-porto-vecchio.svg'),
  // UI Icons
  'ui-addUser': import('ASSETS/icons/uiIcons/addUser.svg'),
  'ui-alert-triangle': import('ASSETS/icons/uiIcons/alert-triangle.svg'),
  'ui-alertCircle': import('ASSETS/icons/uiIcons/alertCircle.svg'),
  'ui-answer': import('ASSETS/icons/uiIcons/answer.svg'),
  'ui-applications': import('ASSETS/icons/uiIcons/applications.svg'),
  'ui-arrowDown': import('ASSETS/icons/uiIcons/arrowDown.svg'),
  'ui-arrowLeft': import('ASSETS/icons/uiIcons/arrowLeft.svg'),
  'ui-arrowRight': import('ASSETS/icons/uiIcons/arrowRight.svg'),
  'ui-arrowUp': import('ASSETS/icons/uiIcons/arrowUp.svg'),
  'ui-attachment': import('ASSETS/icons/uiIcons/attachment.svg'),
  'ui-audio': import('ASSETS/icons/uiIcons/audio.svg'),
  'ui-block': import('ASSETS/icons/uiIcons/block.svg'),
  'ui-burgerMenu': import('ASSETS/icons/uiIcons/burgerMenu.svg'),
  'ui-calendar': import('ASSETS/icons/uiIcons/calendar.svg'),
  'ui-calendarLight': import('ASSETS/icons/uiIcons/calendarLight.svg'),
  'ui-camera': import('ASSETS/icons/uiIcons/camera.svg'),
  'ui-check': import('ASSETS/icons/uiIcons/check.svg'),
  'ui-clock': import('ASSETS/icons/uiIcons/clock.svg'),
  'ui-close': import('ASSETS/icons/uiIcons/close.svg'),
  'ui-closeFullScreen': import('ASSETS/icons/uiIcons/closeFullScreen.svg'),
  'ui-copy': import('ASSETS/icons/uiIcons/copy.svg'),
  'ui-cut': import('ASSETS/icons/uiIcons/cut.svg'),
  'ui-delete': import('ASSETS/icons/uiIcons/delete.svg'),
  'ui-depositeInbox': import('ASSETS/icons/uiIcons/depositeInbox.svg'),
  'ui-download': import('ASSETS/icons/uiIcons/download.svg'),
  'ui-drag': import('ASSETS/icons/uiIcons/drag.svg'),
  'ui-edit': import('ASSETS/icons/uiIcons/edit.svg'),
  'ui-error': import('ASSETS/icons/uiIcons/error.svg'),
  'ui-external-link': import('ASSETS/icons/uiIcons/external-link.svg'),
  'ui-externalLink': import('ASSETS/icons/uiIcons/externalLink.svg'),
  'ui-eye': import('ASSETS/icons/uiIcons/eye.svg'),
  'ui-eyeSlash': import('ASSETS/icons/uiIcons/eyeSlash.svg'),
  'ui-filter': import('ASSETS/icons/uiIcons/filter.svg'),
  'ui-flag': import('ASSETS/icons/uiIcons/flag.svg'),
  'ui-folder': import('ASSETS/icons/uiIcons/folder.svg'),
  'ui-folderMove': import('ASSETS/icons/uiIcons/folderMove.svg'),
  'ui-fullScreen': import('ASSETS/icons/uiIcons/fullScreen.svg'),
  'ui-globe': import('ASSETS/icons/uiIcons/globe.svg'),
  'ui-hide': import('ASSETS/icons/uiIcons/hide.svg'),
  'ui-home': import('ASSETS/icons/uiIcons/home.svg'),
  'ui-hourglass': import('ASSETS/icons/uiIcons/hourglass.svg'),
  'ui-image': import('ASSETS/icons/uiIcons/image.svg'),
  'ui-inbox': import('ASSETS/icons/uiIcons/inbox.svg'),
  'ui-infoCircle': import('ASSETS/icons/uiIcons/infoCircle.svg'),
  'ui-listOrder': import('ASSETS/icons/uiIcons/listOrder.svg'),
  'ui-lock': import('ASSETS/icons/uiIcons/lock.svg'),
  'ui-mail': import('ASSETS/icons/uiIcons/mail.svg'),
  'ui-mailRead': import('ASSETS/icons/uiIcons/mailRead.svg'),
  'ui-mailUnread': import('ASSETS/icons/uiIcons/mailUnread.svg'),
  'ui-messageInfo': import('ASSETS/icons/uiIcons/messageInfo.svg'),
  'ui-mic': import('ASSETS/icons/uiIcons/mic.svg'),
  'ui-minus': import('ASSETS/icons/uiIcons/minus.svg'),
  'ui-move': import('ASSETS/icons/uiIcons/move.svg'),
  'ui-options': import('ASSETS/icons/uiIcons/options.svg'),
  'ui-pause': import('ASSETS/icons/uiIcons/pause.svg'),
  'ui-play': import('ASSETS/icons/uiIcons/play.svg'),
  'ui-play-filled': import('ASSETS/icons/uiIcons/play-filled.svg'),
  'ui-plus': import('ASSETS/icons/uiIcons/plus.svg'),
  'ui-print': import('ASSETS/icons/uiIcons/print.svg'),
  'ui-question': import('ASSETS/icons/uiIcons/question.svg'),
  'ui-rafterDown': import('ASSETS/icons/uiIcons/rafterDown.svg'),
  'ui-rafterLeft': import('ASSETS/icons/uiIcons/rafterLeft.svg'),
  'ui-rafterRight': import('ASSETS/icons/uiIcons/rafterRight.svg'),
  'ui-rafterUp': import('ASSETS/icons/uiIcons/rafterUp.svg'),
  'ui-recordVideo': import('ASSETS/icons/uiIcons/recordVideo.svg'),
  'ui-recordVoice': import('ASSETS/icons/uiIcons/recordVoice.svg'),
  'ui-redo': import('ASSETS/icons/uiIcons/redo.svg'),
  'ui-refresh': import('ASSETS/icons/uiIcons/refresh.svg'),
  'ui-save': import('ASSETS/icons/uiIcons/save.svg'),
  'ui-search': import('ASSETS/icons/uiIcons/search.svg'),
  'ui-see': import('ASSETS/icons/uiIcons/see.svg'),
  'ui-send': import('ASSETS/icons/uiIcons/send.svg'),
  'ui-settings': import('ASSETS/icons/uiIcons/settings.svg'),
  'ui-share': Platform.select({
    ios: import('ASSETS/icons/uiIcons/shareIOS.svg'),
    android: import('ASSETS/icons/uiIcons/shareAOS.svg'),
  }),
  'ui-skills': import('ASSETS/icons/uiIcons/skills.svg'),
  'ui-success_fill': import('ASSETS/icons/uiIcons/success_fill.svg'),
  'ui-success_outline': import('ASSETS/icons/uiIcons/success_outline.svg'),
  'ui-success': import('ASSETS/icons/uiIcons/success.svg'),
  'ui-textPage': import('ASSETS/icons/uiIcons/textPage.svg'),
  'ui-tool': import('ASSETS/icons/uiIcons/tool.svg'),
  'ui-trash': import('ASSETS/icons/uiIcons/trash.svg'),
  'ui-trending-up': import('ASSETS/icons/uiIcons/trending-up.svg'),
  'ui-unarchive': import('ASSETS/icons/uiIcons/unarchive.svg'),
  'ui-upload': import('ASSETS/icons/uiIcons/upload.svg'),
  'ui-user': import('ASSETS/icons/uiIcons/user.svg'),
  'ui-users': import('ASSETS/icons/uiIcons/users.svg'),
  'ui-userSearch': import('ASSETS/icons/uiIcons/userSearch.svg'),
  'ui-video': import('ASSETS/icons/uiIcons/video.svg'),
  'ui-walk': import('ASSETS/icons/uiIcons/walk.svg'),
  'ui-warning': import('ASSETS/icons/uiIcons/warning.svg'),
  'ui-wavering': import('ASSETS/icons/uiIcons/wavering.svg'),
  'ui-write': import('ASSETS/icons/uiIcons/write.svg'),
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
  form: import('ASSETS/icons/moduleIcons/form.svg'),
  forum: import('ASSETS/icons/moduleIcons/forum.svg'),
  homeLiaisonDiary: import('ASSETS/icons/moduleIcons/homeLiaisonDiary.svg'),
  homework1D: import('ASSETS/icons/moduleIcons/homework1D.svg'),
  homework2D: import('ASSETS/icons/moduleIcons/homework2D.svg'),
  homeworkAssistance: import('ASSETS/icons/moduleIcons/homeworkAssistance.svg'),
  mediacentre: import('ASSETS/icons/moduleIcons/mediacentre.svg'),
  messages: import('ASSETS/icons/moduleIcons/messages.svg'),
  moodle: import('ASSETS/icons/moduleIcons/moodle.svg'),
  newsFeed: import('ASSETS/icons/moduleIcons/newsFeed.svg'),
  pad: import('ASSETS/icons/moduleIcons/pad.svg'),
  pages: import('ASSETS/icons/moduleIcons/pages.svg'),
  peertube: import('ASSETS/icons/moduleIcons/peertube.svg'),
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
  wekan: import('ASSETS/icons/moduleIcons/wekan.svg'),
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
  'empty-form': import('ASSETS/images/empty-screen/empty-form.svg'),
  'empty-form-access': import('ASSETS/images/empty-screen/empty-form-access.svg'),
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
  'homework-assistance-home': import('ASSETS/images/homework-assistance-home.svg'),
  'image-not-found': import('ASSETS/images/empty-screen/image-not-found.svg'),
  'form-default': import('ASSETS/images/form-default.svg'),
  'onboarding-0': import('ASSETS/images/onboarding/onboarding_0.svg'),
  'onboarding-1': import('ASSETS/images/onboarding/onboarding_1.svg'),
  'onboarding-2': import('ASSETS/images/onboarding/onboarding_2.svg'),
  'onboarding-3': import('ASSETS/images/onboarding/onboarding_3.svg'),
  'pictos-answer': import('ASSETS/images/pictos/answer.svg'),
  'pictos-arrow-right': import('ASSETS/images/pictos/arrow-right.svg'),
  'pictos-close': import('ASSETS/images/pictos/close.svg'),
  'pictos-error': import('ASSETS/images/pictos/error.svg'),
  'pictos-external-link': import('ASSETS/images/pictos/external-link.svg'),
  'pictos-mail': import('ASSETS/images/pictos/mail.svg'),
  'pictos-redo': import('ASSETS/images/pictos/redo.svg'),
  'pictos-save': import('ASSETS/images/pictos/save.svg'),
  'pictos-send': import('ASSETS/images/pictos/send.svg'),
  'pictos-smartphone': import('ASSETS/images/pictos/smartphone.svg'),
  'pictos-success-outline': import('ASSETS/images/pictos/success-outline.svg'),
  'schoolbook-canteen': import('ASSETS/images/schoolbook/canteen.svg'),
  'schoolbook-event': import('ASSETS/images/schoolbook/event.svg'),
  'schoolbook-last-minute': import('ASSETS/images/schoolbook/last-minute.svg'),
  'schoolbook-leisure': import('ASSETS/images/schoolbook/leisure.svg'),
  'schoolbook-outing': import('ASSETS/images/schoolbook/outing.svg'),
  'schoolbook-various': import('ASSETS/images/schoolbook/various.svg'),
  'textbook-default': import('ASSETS/images/textbook-default.svg'),
  'user-email': import('ASSETS/images/user/email.svg'),
  'user-smartphone': import('ASSETS/images/user/smartphone.svg'),
  'userpage-header': import('ASSETS/images/userpage-header.svg'),
  xmas: import('ASSETS/images/xmas.svg'),
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
