import { monthsName, tr } from "../i18n/t"

export function getTimeToStr(timestamp) {
	if (sameDay(timestamp)) {
		const dateHours = new Date(timestamp).getHours()
		const nowHours = new Date().getHours()
		const dateMn = new Date(timestamp).getMinutes()
		const nowMn = new Date().getMinutes()
		const hours = nowHours - dateHours
		const mn = nowMn - dateMn

		if (hours === 0) return tr.agoMinutes(mn)
		else if (hours === 1) return tr.agoHour(hours)
		else return tr.agoHours(hours)
	}
	const date = new Date(timestamp)
	const day = date.getDate()
	const monthName = monthsName(date)
	const year = date.getFullYear()
	const nowYear = new Date().getFullYear()

	if (year !== nowYear) return `${day} ${monthName} ${year}`

	return `${day} ${monthName}`
}

export function getTimeToShortStr(timestamp) {
	if (sameDay(timestamp)) {
		const dateHours = new Date(timestamp).getHours()
		const nowHours = new Date().getHours()
		const dateMn = new Date(timestamp).getMinutes()
		const nowMn = new Date().getMinutes()
		const hours = nowHours - dateHours
		const mn = nowMn - dateMn

		if (hours === 0) return `${mn} mn`
		else return `${dateHours}:${dateMn}`
	}
	const date = new Date(timestamp)
	const day = date.getDate()
	const monthName = monthsName(date)

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
