import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {ProgressBar} from '../../../components/ui/ProgressBar'

const mapStateToProps = (state) => ({
  isLoadings: [
    state.auth.isLoading,
  ],
})

const dispatchAndMapActions = dispatch => bindActionCreators({}, dispatch)

export default connect(mapStateToProps, dispatchAndMapActions)(ProgressBar)
