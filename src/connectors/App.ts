import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { login } from '../actions/auth'
import {App, AppProps} from '../components/App'


const mapStateToProps = (state) => ({
    auth: state.auth,
})

const dispatchAndMapActions = dispatch => bindActionCreators({ login }, dispatch)

export default connect<{}, {}, AppProps>(mapStateToProps, dispatchAndMapActions)(App)