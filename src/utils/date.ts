import I18n from 'i18n-js';

export function isValidDate(timestamp) {
  return new Date(timestamp) instanceof Date && !isNaN(new Date(timestamp));
}

export function getTimeToStr(timestamp) {
  if (!isValidDate(timestamp)) {
    return '';
  }
  if (sameDay(timestamp)) {
    const dateHours = new Date(timestamp).getHours();
    const nowHours = new Date().getHours();
    let dateMn = new Date(timestamp).getMinutes();
    const nowMn = new Date().getMinutes();
    const hours = nowHours - dateHours;
    let mn = nowMn - dateMn;
    if (dateMn < 10) {
      (dateMn as any) = '0' + dateMn;
    }

    if (hours === 0) return I18n.t('agoMinutes', { minutes: mn });
    else return I18n.t('agoHours', { hours });
  }
  const date = new Date(timestamp);
  const day = date.getDate();
  const monthName = I18n.strftime(date, '%b');
  const year = date.getFullYear();
  const nowYear = new Date().getFullYear();

  if (year !== nowYear) return `${day} ${monthName} ${year}`;

  return `${day} ${monthName}`;
}

export function getTimeToShortStr(timestamp) {
  if (!isValidDate(timestamp)) {
    return '';
  }
  if (sameDay(timestamp)) {
    const dateHours = new Date(timestamp).getHours();
    const nowHours = new Date().getHours();
    let dateMn = new Date(timestamp).getMinutes();
    const nowMn = new Date().getMinutes();
    const hours = nowHours - dateHours;
    let mn = nowMn - dateMn;
    if (dateMn < 10) {
      (dateMn as any) = '0' + dateMn;
    }

    if (hours === 0) return `${mn} min`;
    else return `${dateHours}:${dateMn}`;
  }
  const date = new Date(timestamp);
  const day = date.getDate();
  const monthName = I18n.strftime(date, '%b');

  return `${day} ${monthName}`;
}

export function sameDay(timestamp) {
  const now = Date.now();

  if (now - timestamp > 1000 * 3600 * 24) return false;

  const date = new Date(timestamp);
  const todayDate = new Date();

  if (date.getDate() !== todayDate.getDate() || date.getMonth() !== todayDate.getMonth()) return false;

  return true;
}
