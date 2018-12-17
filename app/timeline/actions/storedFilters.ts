import { AsyncStorage } from "react-native";

export const timelineApps = ["BLOG", "NEWS", "SCHOOLBOOK"];

function getLegalTimelineApps(apps: string[]) {
  return timelineApps.filter(app => apps.includes(app.toLowerCase()));
}

export const storedFilters = async legalapps => {
  const arrayapps = getLegalTimelineApps(legalapps);
  const objectapps = arrayapps.reduce(
    (acc, el) => ({ ...acc, [el]: true }),
    {}
  );
  const storedappsJSON = await AsyncStorage.getItem("timeline-filters");
  let storedapps: object = {};
  if (storedappsJSON) {
    storedapps = JSON.parse(storedappsJSON);
    for (const app in objectapps) {
      if (storedapps.hasOwnProperty(app)) {
        objectapps[app] = storedapps[app];
      }
    }
  }
  return objectapps;
};

export const storeFilters = async availableApps =>
  await AsyncStorage.setItem("timeline-filters", JSON.stringify(availableApps));
