export default {
	name: "Log_out",
	format(action) {
		return {
			$email: action.payload.email,
		}
	},
}
