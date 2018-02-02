import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { filter } from "../../actions/filter"
import { SearchBar, SearchBarProps } from "../../ui/SearchBar"

const mapStateToProps = () => ({})

const dispatchAndMapActions = dispatch => bindActionCreators({ filter }, dispatch)

export default connect<{}, {}, SearchBarProps>(mapStateToProps, dispatchAndMapActions)(SearchBar)
