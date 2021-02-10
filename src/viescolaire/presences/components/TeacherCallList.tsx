import I18n from "i18n-js";
import moment from "moment";
import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import RNCarousel, { Pagination } from "react-native-snap-carousel";

import { Loading } from "../../../ui";
import { TextBold } from "../../../ui/Typography";
import { ICourses } from "../state/teacherCourses";
import CourseComponent from "./CourseComponent";

interface ICallListProps {
  courseList: ICourses[];
  onCoursePress: (course: any) => void;
  isFetching: boolean;
}

interface ICallListState {
  currentIndex: number;
}

export default class CallList extends React.PureComponent<ICallListProps, ICallListState> {
  public carouselRef: any;

  constructor(props) {
    super(props);
    this.state = { currentIndex: this.getCurrentCourseIndex(props.courseList) };
  }

  componentWillUpdate(nextProps) {
    if (this.props.courseList !== nextProps.courseList)
      this.setState({ currentIndex: this.getCurrentCourseIndex(nextProps.courseList) });
  }

  private getCurrentCourseIndex(courseList) {
    const courseIndexNow = courseList.findIndex(course =>
      moment().isBetween(moment(course.startDate), moment(course.endDate))
    );
    return courseIndexNow !== -1 ? courseIndexNow : 0;
  }

  private Carousel = () => {
    const getCourseCallItem = item => {
      const isCourseNow = moment().isBetween(moment(item.startDate).subtract(15, "minutes"), moment(item.endDate));
      const isCourseEditable = !moment(item.startDate).subtract(15, "minutes").isAfter(moment());

      return (
        <CourseComponent
          onPress={() => onCoursePress(item)}
          item={item}
          isCourseEditable={isCourseEditable}
          isCourseNow={isCourseNow}
        />
      );
    };

    const { courseList, onCoursePress } = this.props;

    return (
      <>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <RNCarousel
            useScrollView
            data={courseList}
            onLayout={() => setTimeout(() => this.carouselRef.snapToItem(this.state.currentIndex), 500)}
            renderItem={({ item }) => getCourseCallItem(item)}
            sliderWidth={useWindowDimensions().width}
            itemWidth={useWindowDimensions().width * 0.8}
            containerCustomStyle={{ height: 500 }}
            onBeforeSnapToItem={index => this.setState({ currentIndex: index })}
            inactiveSlideScale={0.7}
            ref={r => (this.carouselRef = r)}
          />
        </View>
        <Pagination
          dotsLength={courseList.length}
          activeDotIndex={this.state.currentIndex}
          dotStyle={styles.carouselDot}
          inactiveDotStyle={styles.carouselInactiveDot}
        />
      </>
    );
  };

  public render() {
    const { isFetching, courseList } = this.props;
    return (
      <View
        style={{
          paddingVertical: 8,
          paddingHorizontal: 27,
          flex: 1,
        }}>
        <TextBold style={{ fontSize: 15, marginBottom: 30 }}>
          {I18n.t("viesco-register-date")} {moment().format("DD MMMM YYYY")}
        </TextBold>
        <View style={{ flex: 1, justifyContent: "space-evenly" }}>
          {isFetching ? (
            <Loading />
          ) : courseList.length === 0 ? (
            <>
              <View style={[styles.noCallChip, { backgroundColor: "#E61610" }]} />
              <TextBold style={styles.noCallText}>{I18n.t("viesco-no-register-today")}</TextBold>
              <View style={[styles.noCallChip, { backgroundColor: "#FFB600" }]} />
            </>
          ) : (
            <this.Carousel />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  noCallText: {
    alignSelf: "center",
    fontSize: 15,
    color: "grey",
  },
  noCallChip: {
    alignSelf: "center",
    height: 18,
    width: 60,
    borderRadius: 10,
  },
  carouselDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFB600",
  },
  carouselInactiveDot: {
    borderRadius: 10,
    backgroundColor: "grey",
  },
});
