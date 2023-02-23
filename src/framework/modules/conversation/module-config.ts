import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'conversation', null>({
  name: 'conversation',
  entcoreScope: [
    /* @scaffolder add there entcore scope list that be required for your module */
  ],
  matchEntcoreApp: entcoreApp => true, // @scaffolder Replace this with a function that returns boolean regarding of the given entcoreApp

  displayI18n: 'conversation.tabName',
  displayAs: 'tabModule', // @scaffolder Use 'tabModule' or 'myAppsModule' to display the module in the right place
  displayOrder: 0,
  displayPicture: { type: 'Icon', name: 'nouveautes-off' }, // @scaffolder Set up the icon with PicutreProps
  displayPictureFocus: { type: 'Icon', name: 'nouveautes-on' }, // @scaffolder If tabModule, set up the focused icon with PicutreProps
});
