var Matomo = require('react-native').NativeModules.Matomo;

module.exports = {
  initTracker: Matomo.initTracker,
  setAppOptOut: function (isOptedOut) {
    Matomo.setAppOptOut(isOptedOut);
  },
  setCustomDimension: function (id, value) {
    Matomo.setCustomDimension(id, value ? value + '' : null);
  },
  setUserId: function (userId) {
    if (userId !== null && (userId !== userId) !== undefined) {
      Matomo.setUserId(userId + '');
    }
  },
  trackAppDownload: Matomo.trackAppDownload,
  trackCampaign: function (name, keyword) {
    Matomo.trackCampaign(name, keyword);
  },
  trackContentImpression: function (name, piece, target) {
    Matomo.trackContentImpression(name, { piece, target });
  },
  trackContentInteraction: function (name, interaction, piece, target) {
    Matomo.trackContentInteraction(name, { interaction, piece, target });
  },
  trackEvent: function (category, action, name, value, url) {
    Matomo.trackEvent(category, action, { name, url, value });
  },
  trackGoal: function (goalId, revenue) {
    Matomo.trackGoal(goalId, { revenue });
  },
  trackScreen: function (path, title) {
    Matomo.trackScreen(path, title);
  },
  trackSearch: function (query, category, resultCount, url) {
    Matomo.trackSearch(query, { category, resultCount, url });
  },
};
