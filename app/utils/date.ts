const monthsName = ["janv", "fév", "mars", "avr", "mai", "juin", "juil", "aout", "sept", "oct", "nov", "déc"]

export function getMnHoursDayMonthFromTime(timestamp) {
	if (sameDay(timestamp)) {
		const dateHours = new Date(timestamp).getHours()
		const nowHours = new Date().getHours()
		const dateMn = new Date(timestamp).getMinutes()
		const nowMn = new Date().getMinutes()
		const hours = nowHours - dateHours
		const mn = nowMn - dateMn

		if (hours === 0) return `${mn} mn`
		else return `${hours} h`
	}
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
