import { createStackNavigator } from "react-navigation-stack";
import { FilterTimelineConnect } from "./containers/FilterTimeline";
import { NewsContentRouter } from "./containers/NewsContent";
import Timeline from "./containers/Timeline";
import BlogSelectorPage from "./containers/BlogSelectorPage";
import BlogCreatePostPage from "./containers/BlogCreatePostPage";

export default createStackNavigator(
  {
    notifications: {
      screen: Timeline
    },

    filterTimeline: {
      screen: FilterTimelineConnect
    },

    newsContent: {
      screen: NewsContentRouter
    },

    blogSelect: {
      screen: BlogSelectorPage
    },

    blogCreatePost: {
      screen: BlogCreatePostPage
    }
  }
);
