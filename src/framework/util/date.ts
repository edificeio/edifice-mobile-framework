import I18n from "i18n-js";
import moment, { Moment } from "moment";

moment.relativeTimeThreshold("m", 60);

export const displayPastDate = (pastDate: Moment, longFormat?: boolean) => {
  const now = moment();

  if (!pastDate || !pastDate.isValid()) {
    return I18n.t("common.date.invalid");
  }

  if (longFormat) {
    if (/*less than 2d*/ pastDate.isSameOrAfter(now.clone().subtract(2, "day").startOf("day"))) {
      return pastDate.format("LL - H:mm");
    } else return pastDate.format("dddd LL");
  }
  
  if (/*less than 1min*/ pastDate.isAfter(now.clone().subtract(1, "minute"))) {
    return I18n.t("common.date.now"); 
  } else if (/*less than 3h*/ pastDate.isSameOrAfter(now.clone().subtract(3, "hour"))) {
    return pastDate.fromNow();
  } else if (/*today*/ pastDate.isSame(now, "day")) {
    return pastDate.format("HH[:]mm");
  } else if (/*yesterday*/ pastDate.clone().add(1, "day").isSame(now, "day")) {
    return I18n.t("common.date.yesterday");
  } else if (/*less than 7d*/ pastDate.isSameOrAfter(now.clone().subtract(6, "day").startOf("day"))) {
    return pastDate.format("dddd");
  } else if (/*this year*/ pastDate.isSame(now, "year")) {
    return pastDate.format("D MMM");
  } else /*before this year*/ return pastDate.format("D MMM YYYY"); 
}
