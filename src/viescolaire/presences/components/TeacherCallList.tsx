import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, Dimensions, ImageBackground } from "react-native";
import RNCarousel, { Pagination } from "react-native-snap-carousel";

import { Icon } from "../../../ui";
import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import { Text, TextBold } from "../../../ui/text";
import { BottomColoredItem } from "../../viesco/components/Item";

const CoursesCallSheet = ({ color, text, onPress, opacityNb }) => {
  return (
    <TouchableOpacity onPress={onPress} style={{ opacity: opacityNb }}>
      <BottomColoredItem shadow style={style.coursesCardContainer} color={color}>
        <ImageBackground
          source={require("../../../../assets/viesco/presences.png")}
          style={{ width: "100%", height: 180, opacity: 1 }}
          imageStyle={style.image}
          resizeMode="contain">
          <View style={[style.gridInfoContainer, { marginBottom: 30 }]}>
            <Icon size={20} name="access_time" />
            <Text>
              {text.start_hour} - {text.end_hour}
            </Text>
          </View>

          <TextBold style={{ fontSize: 20, marginBottom: 30 }}>{text.grade}</TextBold>

          <View style={[style.gridInfoContainer, { marginBottom: 30 }]}>
            <Icon size={20} name="pin_drop" />
            <Text>
              {I18n.t("viesco-room")} {text.classroom}
            </Text>
          </View>
        </ImageBackground>
      </BottomColoredItem>
    </TouchableOpacity>
  );
};

export default class CallList extends React.PureComponent<any, any> {
  public carouselRef: any;
  constructor(props) {
    super(props);

    const { courses, register, teacher_id, structure_id } = props;
    this.state = {
      coursesDataList: courses.data,
      fetching: courses.isFetching || register.isFetching,
      teacherId: teacher_id,
      structureId: structure_id,
      startDate: moment().format("YYYY-MM-DD"),
      endDate: moment().format("YYYY-MM-DD"),
      activeIndex: 0,
      firstItemIndex: 0,
    };
  }

  componentDidMount() {
    this.props.fetchCourses(this.state.teacherId, this.state.structureId, this.state.startDate, this.state.endDate);
  }

  componentDidUpdate(prevProps) {
    const { courses, register, structure_id } = this.props;
    const fetching = courses.isFetching || register.isFetching;
    this.setState(
      {
        coursesDataList: courses.data,
        registerId: register.data.id,
        structureId: structure_id,
        fetching,
      },
      () => {
        if (prevProps.courses.data.length === 0 && courses.data.length > 0) this.carouselDisplayCurrentCourse();
      }
    );
    if (prevProps.structure_id !== structure_id) {
      this.props.fetchCourses(this.state.teacherId, structure_id, this.state.startDate, this.state.endDate);
    }
  }

  async getCourseRegisterId(course, index) {
    let courseRegisterInfos = {
      id: course.id,
      classroom: course.roomLabels,
      grade: course.classes,
      registerId: course.registerId,
    };

    if (course.registerId === null) {
      const courseData = JSON.stringify({
        course_id: course.id,
        structure_id: course.structureId,
        start_date: moment(course.startDate).format("YYYY-MM-DD HH:mm:ss"),
        end_date: moment(course.endDate).format("YYYY-MM-DD HH:mm:ss"),
        subject_id: course.subjectId,
        groups: course.groups,
        classes: course.classes,
        split_slot: true,
      });

      this.props.fetchRegisterId(courseData);
    }

    this.props.navigation.navigate("CallSheetPage", { courseInfos: courseRegisterInfos });
  }

  private _renderItem({ item, index }) {
    const isCourseStarted = item.startDate.isAfter(moment());
    const isCourseEnded = item.endDate.isAfter(moment());
    return (
      <CoursesCallSheet
        onPress={() => this.getCourseRegisterId(item, index)}
        text={{
          start_hour: moment(item.startDate).format("LT"),
          end_hour: moment(item.endDate).format("LT"),
          grade: item.classes,
          classroom: item.roomLabels,
        }}
        color="#FFB600"
        opacityNb={isCourseStarted || isCourseEnded ? 1 : 0.4}
      />
    );
  }

  private carouselDisplayCurrentCourse() {
    const { coursesDataList } = this.state;
    const coursesList = coursesDataList.sort((a, b) => a.startDate - b.startDate);
    const dataLength = coursesList.length - 1;
    let index = coursesList.findIndex(index => moment(index.endDate).isAfter(moment()));
    if (index === -1) {
      index = dataLength;
    }
    this.setState({ coursesDataList: [...coursesList], firstItemIndex: index }, () => {
      if (this.carouselRef !== null && this.carouselRef !== undefined) {
        setTimeout(() => this.carouselRef.snapToItem(index), 750);
      }
    });
  }

  private displayCoursesCalls() {
    const { width } = Dimensions.get("window");
    return (
      <View>
        <TextBold style={{ fontSize: 15, marginBottom: 10 }}>
          {I18n.t("viesco-register-date")} {moment(this.state.startDate).format("DD MMMM YYYY")}
        </TextBold>
        <RNCarousel
          data={this.state.coursesDataList}
          renderItem={e => this._renderItem(e)}
          sliderWidth={width - 54}
          itemWidth={width - 54}
          ref={r => (this.carouselRef = r)}
          onSnapToItem={index => this.setState({ activeIndex: index })}
        />
        <Pagination
          dotsLength={this.state.coursesDataList.length}
          activeDotIndex={this.state.activeIndex}
          dotStyle={style.carouselDot}
          inactiveDotStyle={style.carouselInactiveDot}
        />
      </View>
    );
  }

  public render() {
    return (
      <View style={style.dashboardPart}>
        {this.state.coursesDataList[0] !== undefined ? (
          this.displayCoursesCalls()
        ) : (
          <View style={{ height: "58%" }}>
            <TextBold style={{ fontSize: 15, marginBottom: "15%" }}>
              {I18n.t("viesco-register-date")} {moment().format("DD MMMM YYYY")}
            </TextBold>
            <View style={[style.noCallChip, { backgroundColor: "#E61610" }]} />
            <Text style={style.noCallText}>{I18n.t("viesco-no-register-today")}</Text>
            <View style={[style.noCallChip, { backgroundColor: "#FFB600" }]} />
          </View>
        )}
      </View>
    );
  }
}

const style = StyleSheet.create({
  dashboardPart: {
    paddingVertical: 8,
    paddingHorizontal: 27,
  },
  noCallText: {
    alignSelf: "center",
    marginBottom: "15%",
    fontSize: 15,
    color: "grey",
  },
  noCallChip: {
    alignSelf: "center",
    marginBottom: "15%",
    height: 18,
    width: 60,
    borderRadius: 10,
  },
  coursesCardContainer: {
    alignItems: "flex-start",
    flexDirection: "column",
    elevation: 2,
    marginLeft: 5,
    marginRight: 5,
  },
  gridInfoContainer: {
    flexDirection: "row",
  },
  image: {
    alignSelf: "flex-end",
    opacity: 0.2,
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
