import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, Dimensions, ImageBackground } from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";

import { Icon } from "../../../ui";
import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import { Text, TextBold } from "../../../ui/text";
import { BottomColoredItem } from "../../viesco/components/Item";

const CoursesCallSheet = ({ color, text, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <BottomColoredItem shadow style={style.coursesCardContainer} color={color}>
        <ImageBackground
          source={require("../../../../assets/viesco/presences.png")}
          style={{ width: "100%", height: 180 }}
          imageStyle={style.image}
          resizeMode="contain">
          <View style={[style.gridInfoContainer, { marginBottom: 30 }]}>
            <Icon size={20} name="access_time" />
            <Text>
              {text.start_hour} - {text.end_hour}
            </Text>
          </View>

          <TextBold style={{ fontSize: 20, marginBottom: 30 }}>6ème6</TextBold>
          <Text>
            {I18n.t("viesco-room")} {text.classroom}
          </Text>
        </ImageBackground>
      </BottomColoredItem>
    </TouchableOpacity>
  );
};

export default class CallList extends React.PureComponent<any, any> {
  constructor(props) {
    super(props);

    const { courses, register } = props;
    this.state = {
      coursesDataList: courses.data,
      fetching: courses.isFetching || register.isFetching,
      teacherId: "95eb76f0-273f-4a55-95e4-8739c06fdfff",
      structureId: "97a7363c-c000-429e-9c8c-d987b2a2c204",
      startDate: moment().format("YYYY-MM-DD"),
      endDate: moment().format("YYYY-MM-DD"),
      registerId: "16307",
      activeIndex: 0,
    };
  }

  componentDidMount() {
    this.props.fetchCourses(this.state.teacherId, this.state.structureId, this.state.startDate, this.state.endDate);
  }

  componentDidUpdate() {
    const { courses, register } = this.props;
    const fetching = courses.isFetching || register.isFetching;
    this.setState({
      coursesDataList: courses.data,
      registerId: register.data.id,
      fetching,
    });
  }

  async getCourseRegisterId(course) {
    const courseData = JSON.stringify({
      course_id: course.id,
      structure_id: course.structureId,
      start_date: moment(course.startDate).format("YYYY-MM-DD HH:MM:SS"),
      end_date: moment(course.endDate).format("YYYY-MM-DD HH:MM:SS"),
      subject_id: course.subjectId,
      groups: course.groups,
      classes: course.classes,
      split_slot: true,
    });

    await this.props.fetchRegisterId(courseData);
    const { register } = this.props;
    const fetching = register.isFetching;
    this.setState({
      registerId: register.data.id,
      fetching,
    });
    this.props.navigation.navigate("CallSheetPage");
  }

  private _renderItem({ item, index }) {
    return (
      <CoursesCallSheet
        onPress={() => this.getCourseRegisterId(item)}
        text={{
          start_hour: moment(item.startDate).format("LT"),
          end_hour: moment(item.endDate).format("LT"),
          grade: item.classes,
          classroom: item.roomLabels,
        }}
        color="#FFB600"
      />
    );
  }

  private displayCoursesCalls() {
    const { width, height } = Dimensions.get("window");
    this.state.coursesDataList.sort((a, b) => a.startDate - b.startDate);
    return (
      <View>
        <TextBold style={{ fontSize: 15, marginBottom: 10 }}>
          {I18n.t("viesco-register-date")} {moment().format("DD MMMM YYYY")}
        </TextBold>
        <Carousel
          ref="carousel"
          data={this.state.coursesDataList}
          renderItem={e => this._renderItem(e)}
          sliderHeight={height}
          sliderWidth={width - 54}
          itemHeight={height}
          itemWidth={width - 54}
          snapOnAndroid={false}
          onSnapToItem={index => this.setState({ activeIndex: index })}
          loop
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
          <View>
            <TextBold style={{ fontSize: 15 }}>
              {I18n.t("viesco-register-date")} {moment().format("DD MMMM YYYY")}
            </TextBold>
            <Text style={{ fontSize: 15, color: "grey" }}>{I18n.t("viesco-no-register-today")}</Text>
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
