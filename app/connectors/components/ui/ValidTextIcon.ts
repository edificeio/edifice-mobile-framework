import { connect } from 'react-redux'
import { ValidTextIcon, ValidTextIconProps } from '../../../components/ui/ValidTextIcon'

const mapStateToProps = state => ({
  isLoadings: [
    state.auth.isLoading,
  ],
})

export default connect<{}, {}, ValidTextIconProps>(mapStateToProps)(ValidTextIcon)
