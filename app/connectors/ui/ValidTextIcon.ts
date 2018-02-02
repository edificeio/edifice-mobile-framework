import { connect } from "react-redux"
import { ValidTextIcon, ValidTextIconProps } from "../../ui/ValidTextIcon"

const mapStateToProps = state => ({
	synced: [state.auth.synced],
})

export default connect<{}, {}, ValidTextIconProps>(mapStateToProps)(ValidTextIcon)
