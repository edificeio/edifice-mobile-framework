const escape1 = "<br><br>"
const escape2 = "<div></div>"
const newLine = "\r\n"

export function clean(html) {
	let res = html
	if (res.startsWith(escape1)) res = res.substr(escape1.length)
	if (res.startsWith(escape2)) res = res.substr(escape2.length)

	res = res.replace(newLine, "").replace(/<div>\u200B<\/div><div>\u200B<\/div>/, "")

	return res
}

export function trunc(res, truncLength) {
	if (res.length > truncLength) {
		res = `${res.substr(0, truncLength)} ...`
	}

	return res
}
