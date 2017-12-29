import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { ProfilUtilisateur, ProfilUtilisateurProps } from "../components/ProfilUtilisateur"

const mapStateToProps = (state, props) => ({
	documents: state.documents.payload,
	navigation: state.navigation,
})

const dispatchAndMapActions = dispatch => bindActionCreators({}, dispatch)

export default connect<{}, {}, ProfilUtilisateurProps>(mapStateToProps, dispatchAndMapActions)(ProfilUtilisateur)
