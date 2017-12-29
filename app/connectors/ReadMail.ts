import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { ReadMail } from "../components/ReadMail"

const mapStateToProps = state => ({
	inbox: state.inbox,
})

const dispatchAndMapActions = dispatch => bindActionCreators({}, dispatch)

export default connect(mapStateToProps, dispatchAndMapActions)(ReadMail)
