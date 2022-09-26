import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Swiper from 'react-native-swiper';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { LoadingIndicator } from '~/framework/components/loading';
import { BodyBoldText, SmallBoldText } from '~/framework/components/text';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';
import CourseComponent from '~/modules/viescolaire/presences/components/CourseComponent';
import { ICourses } from '~/modules/viescolaire/presences/state/teacherCourses';

const styles = StyleSheet.create({
  container: {
    paddingVertical: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.big,
    flex: 1,
  },
  dateText: {
    marginTop: UI_SIZES.spacing.minor,
    marginBottom: UI_SIZES.spacing.small,
  },
  renderContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  noCallText: {
    alignSelf: 'center',
    color: theme.palette.grey.grey,
  },
  noCallChip: {
    alignSelf: 'center',
    height: 18,
    width: 60,
    borderRadius: 10,
  },
  absentColor: { backgroundColor: viescoTheme.palette.presencesEvents.noReason },
  presentColor: { backgroundColor: viescoTheme.palette.presences },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselPagination: {
    position: 'absolute',
    bottom: -50,
  },
  carouselFooter: {
    height: 80,
  },
  carouselDot: {
    backgroundColor: theme.palette.grey.cloudy,
    width: 10,
    height: 10,
    borderRadius: 4,
    marginHorizontal: UI_SIZES.spacing.minor,
    marginTop: UI_SIZES.spacing.tiny,
    marginBottom: UI_SIZES.spacing.tiny,
  },
  carouselActiveDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: viescoTheme.palette.presences,
  },
});

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
    return <View style={styles.carouselDot} />;
  };

  private Carousel = () => {
    const { courseList, onCoursePress } = this.props;
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

    return (
      <>
        <View style={styles.carouselContainer}>
          <Swiper
            automaticallyAdjustContentInsets
            horizontal
            index={this.state.currentIndex}
            paginationStyle={styles.carouselPagination}
            dot={this.setCarouselDotStyle()}
            activeDotStyle={styles.carouselActiveDot}>
            {courseList.map(item => getCourseCallItem(item))}
          </Swiper>
        </View>
        <View style={styles.carouselFooter} />
      </>
    );
  };

  public render() {
    const { isFetching, courseList } = this.props;
    return (
      <View style={styles.container}>
        <SmallBoldText style={styles.dateText}>
          {I18n.t('viesco-register-date')} {moment().format('DD MMMM YYYY')}
        </SmallBoldText>
        <View style={styles.renderContainer}>
          {isFetching ? (
            <LoadingIndicator />
          ) : courseList.length === 0 ? (
            <>
              <View style={[styles.noCallChip, styles.absentColor]} />
              <BodyBoldText style={styles.noCallText}>{I18n.t('viesco-no-register-today')}</BodyBoldText>
              <View style={[styles.noCallChip, styles.presentColor]} />
            </>
          ) : (
            <this.Carousel />
          )}
        </View>
      </View>
    );
  }
}
