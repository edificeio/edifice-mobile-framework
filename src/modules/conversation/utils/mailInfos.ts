export const getMailPeople = (mailInfos) => {
    return {
        from: mailInfos.from
            ? mailInfos.displayNames.find(item => item[0] === mailInfos.from)
            : [undefined, mailInfos.fromName, false],
        to: [
            ...mailInfos.displayNames.filter(dn => mailInfos.to?.includes(dn[0])),
            ...(mailInfos.toName ? mailInfos.toName.map(tn => [undefined, tn, false]) : [])
        ],
        cc: [
            ...mailInfos.displayNames.filter(dn => mailInfos.cc?.includes(dn[0])),
            ...(mailInfos.ccName ? mailInfos.ccName.map(ccn => [undefined, ccn, false]) : [])
        ],
        cci: [
            ...mailInfos.displayNames.filter(dn => mailInfos.cci?.includes(dn[0])),
            ...(mailInfos.cciName ? mailInfos.cciName.map(ccin => [undefined, ccin, false]) : [])
        ]
    } as {
        from: [string | undefined, string, boolean]
        to: [string | undefined, string, boolean][]
        cc: [string | undefined, string, boolean][]
        cci: [string | undefined, string, boolean][]
    }
}