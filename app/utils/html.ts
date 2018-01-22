import { DEVICE_SCALE } from "../constants/layoutSize"

export function clean(html, truncLength) {
	const i = html.indexOf("<div")
	const deb = html.indexOf(">", i)
	let res = html.substr(deb + 1)
	const j = res.indexOf("</div>")
	res = res.substr(0, j)

	return trunc(res.replace("<br>", ", "), truncLength)
}

export function trunc(res, truncLength) {
	if (res.length > truncLength) {
		res = `${res.substr(0, truncLength)} ...`
	}

	return res
}
