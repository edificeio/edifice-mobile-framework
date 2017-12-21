import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { login } from '../actions/auth'
import {App} from '../components/App'

const mapStateToProps = (state, props) => ({
    auth: state.auth,
})

const dispatchAndMapActions = dispatch => bindActionCreators({ login }, dispatch)

export default connect(mapStateToProps, dispatchAndMapActions)(App)