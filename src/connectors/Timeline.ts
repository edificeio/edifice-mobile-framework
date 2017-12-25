import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { readDocumentsFilter } from '../actions/documents'
import {Timeline, TimelineProps} from '../components/Timeline'

const mapStateToProps = (state, props) => ({
    documents: state.documents.payload,
    navigation: props.navigate.navigation,
})

const dispatchAndMapActions = dispatch => bindActionCreators({ readDocumentsFilter }, dispatch)

export default connect<{}, {}, TimelineProps>(mapStateToProps, dispatchAndMapActions)(Timeline)