// ToDo(wiki-migration): remove once `communities` (home screen tile « courses ») no longer imports it
/**
 * Route names of `wiki` read by the modules of the legacy navigation.
 * @deprecated write the route in plain text (`navigation.navigate('wiki/summary', { resourceId })`).
 */
export const wikiRouteNames = {
  summary: 'wiki/summary' as const,
};
