export const getMailPeople = mailInfos => {
  const to: [string | undefined, string, boolean][] = [];
  const cc: [string | undefined, string, boolean][] = [];
  const cci: [string | undefined, string, boolean][] = [];
  for (const dn of mailInfos.displayNames) {
    if (mailInfos.to?.includes(dn[0])) to.push(dn);
    if (mailInfos.cc?.includes(dn[0])) cc.push(dn);
    if (mailInfos.cci?.includes(dn[0])) cci.push(dn);
  }
  for (const tn of mailInfos.toName || []) {
    to.push([undefined, tn, false]);
  }
  for (const tn of mailInfos.ccName || []) {
    cc.push([undefined, tn, false]);
  }
  for (const tn of mailInfos.cciName || []) {
    cci.push([undefined, tn, false]);
  }

  return {
    cc,
    cci,
    from: mailInfos.from ? mailInfos.displayNames.find(item => item[0] === mailInfos.from) : [undefined, mailInfos.fromName, false],
    to,
  } as {
    from: [string | undefined, string, boolean];
    to: [string | undefined, string, boolean][];
    cc: [string | undefined, string, boolean][];
    cci: [string | undefined, string, boolean][];
  };
};
