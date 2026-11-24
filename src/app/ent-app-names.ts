/**
 * Names of the ENT apps, as the old modules know them.
 */
export type OldEntAppName =
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
  | 'external_link'
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
  | 'workspace';

/**
 * Some apps have various names depending of the context :/
 */
export const entAppNameSynonyms = {
  form: 'formulaire',
} satisfies Record<string, OldEntAppName>;

export type OldEntAppNameOrSynonym = OldEntAppName | keyof typeof entAppNameSynonyms;

export const getEntAppName = (name: OldEntAppNameOrSynonym) => (entAppNameSynonyms[name] ?? name) as OldEntAppName;
