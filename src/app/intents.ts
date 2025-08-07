import { navigationRef } from '~/framework/navigation/helper';
import { openUrl } from '~/framework/util/linking';

export type EntAppName =
  | 'appointments'
  | 'archive'
  | 'blog'
  | 'calendar'
  | 'collaborativeeditor'
  | 'collaborativewall'
  | 'communities'
  | 'community'
  | 'competences'
  | 'conversation'
  | 'diary'
  | 'edt'
  | 'exercizer'
  | 'formulaire'
  | 'forum'
  | 'homework-assistance'
  | 'homeworks'
  | 'magneto'
  | 'mediacentre'
  | 'mindmap'
  | 'nabook'
  | 'news'
  | 'pages'
  | 'poll'
  | 'presences'
  | 'rack'
  | 'rbs'
  | 'schoolbook'
  | 'scrapbook'
  | 'sharebigfiles'
  | 'support'
  | 'timeline'
  | 'timelinegenerator'
  | 'userbook'
  | 'wiki'
  | 'workspace'
  | 'zimbra';

export enum INTENT_TYPE {
  OPEN_RESOURCE = 'OPEN_RESOURCE',
}

export interface IntentObjectTypes {
  [INTENT_TYPE.OPEN_RESOURCE]: { id: string };
}

export type IntentCallback<IntentType extends INTENT_TYPE> = (
  info: IntentObjectTypes[IntentType] & { url: string },
  navigation: typeof navigationRef,
) => void;

const defaultIntentCallbacks = {
  [INTENT_TYPE.OPEN_RESOURCE]: (params: Parameters<IntentCallback<INTENT_TYPE>>[0]) => {
    openUrl(params.url);
  },
};

const intents: Partial<Record<EntAppName, Partial<Record<INTENT_TYPE, IntentCallback<INTENT_TYPE>>>>> = {};

export function registerIntent<AppName extends EntAppName, IntentType extends INTENT_TYPE>(
  appName: AppName,
  type: IntentType,
  callback: IntentCallback<IntentType>,
) {
  if (intents[appName]?.[type] !== undefined) {
    console.warn(`Intent for '${appName}' of type ${type} already exists. The new one will replace the older.`);
  }
  intents[appName] ??= {};
  intents[appName][type] = callback as IntentCallback<INTENT_TYPE>;
}

export function openIntent<AppName extends EntAppName, IntentType extends INTENT_TYPE>(
  appName: AppName,
  type: IntentType,
  params: Parameters<IntentCallback<IntentType>>[0],
  navigation: typeof navigationRef = navigationRef,
) {
  if (intents[appName]?.[type] === undefined) {
    defaultIntentCallbacks[type]?.(params);
  } else {
    intents[appName]?.[type]?.(params, navigation);
  }
}
