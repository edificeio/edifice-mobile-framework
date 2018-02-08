const monthsName = ["janv", "fév", "mars", "avr", "mai", "juin", "juil", "aout", "sept", "oct", "nov", "déc"]

export function getDayMonthFromTime(timestamp) {
	const date = new Date(timestamp)
	const day = date.getDate()
	const monthName = monthsName[date.getMonth()]

	return `${day} ${monthName}`
}

export function sameDay(timestamp) {
	const now = Date.now()

	if (now - timestamp > 1000 * 3600 * 24) return false

	const date = new Date(timestamp)
	const todayDate = new Date()

	if (date.getDate() !== todayDate.getDate()) return false

	return true
}
