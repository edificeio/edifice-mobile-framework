import { createStackNavigator } from "react-navigation-stack";
import { FilterTimelineConnect } from "./containers/FilterTimeline";
import { NewsContentRouter } from "./containers/NewsContent";
import Timeline from "./containers/Timeline";
import ContentSelectorPage from "./containers/ContentSelectorPage";
import CreatePostPage from "./containers/CreatePostPage";

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

    contentSelect: {
      screen: ContentSelectorPage
    },

    createPost: {
      screen: CreatePostPage
    }
  }
);
