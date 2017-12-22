import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { readDocumentsFilter } from '../actions/documents'
import {Timeline} from '../components/Timeline'

const mapStateToProps = (state, props) => ({
    documents: state.documents.payload,
})

const dispatchAndMapActions = dispatch => bindActionCreators({ readDocumentsFilter }, dispatch)

export default connect(mapStateToProps, dispatchAndMapActions)(Timeline)