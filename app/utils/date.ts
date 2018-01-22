const monthsName = ["janv", "fév", "mars", "avr", "mai", "juin", "juil", "aout", "sept", "oct", "nov", "déc"]

export function getDayMonthFromTime(timestamp) {
	const date = new Date(timestamp)
	const day = date.getDate()
	const monthName = monthsName[date.getMonth()]

	return `${day} ${monthName}`
}
