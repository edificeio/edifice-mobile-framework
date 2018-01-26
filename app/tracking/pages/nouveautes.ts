export default {
	name: "Nouveautes_page_view",
	isDataReady: state => state.documents && state.documents.payload && state.documents.payload[0],
	format(state, navParams) {
		return {
			message: state.documents.payload[0].folder,
		}
	},
}
