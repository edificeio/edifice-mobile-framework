import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { logout } from "../actions/auth"
import { IProfilUtilisateurProps, ProfilUtilisateur } from "../components/ProfilUtilisateur"

const mapStateToProps = state => ({
	auth: state.auth,
})

const dispatchAndMapActions = dispatch => bindActionCreators({ logout }, dispatch)

export default connect<{}, {}, IProfilUtilisateurProps>(mapStateToProps, dispatchAndMapActions)(ProfilUtilisateur)
