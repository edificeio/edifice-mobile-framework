import I18n from "i18n-js";

export const separateMessageHistory = (messageBody: string) => {
  const historyRegex = /<p(.*)?>&nbsp;<\/p>.*/s;
  const historyMatch = messageBody && messageBody.match(historyRegex);
  const historyHtml = historyMatch &&
  historyMatch[0]
    .replace('key="transfer.from">', `key="transfer.from">${I18n.t("conversation-fromPrefix")}`)
    .replace('key="transfer.date">', `key="transfer.date">${I18n.t("conversation-datePrefix")}`)
    .replace('key="transfer.subject">', `key="transfer.subject">${I18n.t("conversation-subjectPrefixInput")}`)
    .replace('key="transfer.to">', `key="transfer.to">${I18n.t("conversation-receiverPrefixInput")}`)
    .replace('key="transfer.cc">', `key="transfer.cc">${I18n.t("conversation-receiversCCPrefix")}`)
    .replace(/.length - 1 && receiver.displayName">,/g, '.length - 1 && receiver.displayName">')
    .replace(/.length - 1">,/g, '.length - 1">');
  const messageHtml = messageBody && messageBody.replace(historyRegex, "");
  
  return { messageHtml, historyHtml };
}
