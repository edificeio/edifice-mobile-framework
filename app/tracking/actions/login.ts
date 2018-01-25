export default {
	name: "Log_in",
	format(action) {
		return {
			$email: action.payload.email,
		}
	},
}
