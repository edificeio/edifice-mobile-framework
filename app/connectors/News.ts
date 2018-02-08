import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { readNews } from "../actions/news"
import { INewsProps, News } from "../news/News"

const mapStateToProps = state => ({
	news: state.news.payload.sort((a, b) => b.date["$date"] - a.date["$date"]),
})

const dispatchAndMapActions = dispatch => bindActionCreators({ readNews }, dispatch)

export default connect<{}, {}, INewsProps>(mapStateToProps, dispatchAndMapActions)(News)
