export const StyleConf = {
	primary: "#414c94",
	accent: "#ec5d61",
	navbarheight: 64,
}

export const navOptions = (title: string, options?: any) => {
	const result = {
		title,
		headerTintColor: "white",
		headerStyle: {
			backgroundColor: "#414c94",
		},
		headerTitleStyle: {
			alignSelf: "center",
		},
	}

	if (options) {
		Object.assign(result, options)
	}

	return result
}
