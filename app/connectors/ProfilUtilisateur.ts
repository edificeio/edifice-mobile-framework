import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { logout} from "../actions/auth"
import { ProfilUtilisateur, ProfilUtilisateurProps } from "../components/ProfilUtilisateur"

const mapStateToProps = (state, props) => ({
})

const dispatchAndMapActions = dispatch => bindActionCreators({logout}, dispatch)

export default connect<{}, {}, ProfilUtilisateurProps>(mapStateToProps, dispatchAndMapActions)(ProfilUtilisateur)
