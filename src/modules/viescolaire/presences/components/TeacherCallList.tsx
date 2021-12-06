import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';

import CourseComponent from './CourseComponent';

import { ICourses } from '~/modules/viescolaire/presences/state/teacherCourses';
import { Loading } from '~/ui';
import { TextBold } from '~/ui/Typography';

interface ICallListProps {
  courseList: ICourses[];
  isFetching: boolean;
  onCoursePress: (course: any) => void;
  navigation: any;
  isFocused: boolean;
}

interface ICallListState {
  currentIndex: number;
}

export default class CallList extends React.PureComponent<ICallListProps, ICallListState> {
  public carouselRef: any;

  constructor(props) {
    super(props);

    this.state = {
      currentIndex: this.getCurrentCourseIndex(props.courseList),
    };
  }

  componentDidMount() {
    // refresh every 3.5 minutes
    this.interval = setInterval(() => {
      if (this.props.isFocused) {
        this.setState({ currentIndex: this.getCurrentCourseIndex(this.props.courseList) });
      } else {
        clearInterval(this.interval);
      }
    }, 210000);
  }

  componentWillUpdate(nextProps) {
    if (this.props.courseList !== nextProps.courseList)
      this.setState({ currentIndex: this.getCurrentCourseIndex(nextProps.courseList) });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  private getCurrentCourseIndex(courseList) {
    const courseIndexNow = courseList.findIndex(course =>
      moment().isBetween(moment(course.startDate).subtract(1, 'minutes'), moment(course.endDate)),
    );
    return courseIndexNow !== -1 ? courseIndexNow : 0;
  }

  private setCarouselDotStyle = () => {
    return (
      <View
        style={{
          backgroundColor: 'rgba(0,0,0,.1)',
          width: 10,
          height: 10,
          borderRadius: 4,
          marginHorizontal: 10,
          marginTop: 3,
          marginBottom: 3,
        }}
      />
    );
  };

  private Carousel = () => {
    const getCourseCallItem = item => {
      const isCourseNow = moment().isBetween(moment(item.startDate).subtract(15, 'minutes'), moment(item.endDate));
      const isCourseEditable = !moment(item.startDate).subtract(15, 'minutes').isAfter(moment());

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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Swiper
            automaticallyAdjustContentInsets
            horizontal
            index={this.state.currentIndex}
            paginationStyle={{ position: 'absolute', bottom: -50 }}
            dot={this.setCarouselDotStyle()}
            activeDotStyle={styles.carouselActiveDot}>
            {courseList.map(item => getCourseCallItem(item))}
          </Swiper>
        </View>
        <View style={{ height: 80 }} />
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
        <TextBold style={{ fontSize: 15, marginBottom: 10 }}>
          {I18n.t('viesco-register-date')} {moment().format('DD MMMM YYYY')}
        </TextBold>
        <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
          {isFetching ? (
            <Loading />
          ) : courseList.length === 0 ? (
            <>
              <View style={[styles.noCallChip, { backgroundColor: '#E61610' }]} />
              <TextBold style={styles.noCallText}>{I18n.t('viesco-no-register-today')}</TextBold>
              <View style={[styles.noCallChip, { backgroundColor: '#FFB600' }]} />
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
    alignSelf: 'center',
    fontSize: 15,
    color: 'grey',
  },
  noCallChip: {
    alignSelf: 'center',
    height: 18,
    width: 60,
    borderRadius: 10,
  },
  carouselActiveDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFB600',
  },
});
