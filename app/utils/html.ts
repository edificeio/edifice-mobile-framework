const escape = "<br><br>"

export function clean(html) {
	if (html.startsWith(escape)) return html.substr(escape.length)
	return html
}

export function trunc(res, truncLength) {
	if (res.length > truncLength) {
		res = `${res.substr(0, truncLength)} ...`
	}

	return res
}
