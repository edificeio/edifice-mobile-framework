export default getAPIPrefix = state => {
  let result = state.user.auth.appsInfo.find(app =>
    app.displayName && app.displayName.toUpperCase() == "MESSAGERIE"
    || app.displayName && app.displayName.toUpperCase() == "ZIMBRA"
  ).prefix;
  return result;
};
 