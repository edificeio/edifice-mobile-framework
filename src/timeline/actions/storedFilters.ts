import { AsyncStorage } from "react-native";

export const timelineApps = ["Blog", "News", "Schoolbook"];

function getLegalTimelineApps(apps: string[]) {
  // HACK ! Beaceause sometimes "News" is "Actualités" and "Actualités" is "News".
  if (apps.includes("Actualites")) apps.push("News");
  else if (apps.includes("News")) apps.push("Actualites");

  return timelineApps.filter(app => apps.includes(app));
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
