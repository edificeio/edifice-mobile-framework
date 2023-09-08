import moment from 'moment';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Swiper from 'react-native-swiper';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { LoadingIndicator } from '~/framework/components/loading';
import { BodyBoldText, SmallBoldText } from '~/framework/components/text';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { ICourse } from '~/framework/modules/viescolaire/presences/model';

import CallCard from './call-card';

const styles = StyleSheet.create({
  dateText: {
    marginLeft: UI_SIZES.spacing.medium,
    marginVertical: UI_SIZES.spacing.small,
  },
  renderContainer: {
    height: 300,
    justifyContent: 'space-evenly',
  },
  noCallText: {
    alignSelf: 'center',
    color: theme.ui.text.light,
  },
  noCallChip: {
    alignSelf: 'center',
    height: 18,
    width: 60,
    borderRadius: 10,
  },
  absentColor: { backgroundColor: viescoTheme.palette.presencesEvents.noReason },
  presentColor: { backgroundColor: viescoTheme.palette.presences },
  carouselPagination: {
    position: 'absolute',
    bottom: -50,
  },
  carouselFooter: {
    marginBottom: 80,
  },
  carouselDot: {
    width: 10,
    height: 10,
    backgroundColor: theme.palette.grey.cloudy,
    borderRadius: 5,
    marginHorizontal: UI_SIZES.spacing.minor,
    marginVertical: UI_SIZES.spacing.tiny,
  },
  carouselActiveDot: {
    width: 20,
    height: 20,
    backgroundColor: viescoTheme.palette.presences,
    borderRadius: 10,
  },
});

interface ICourseListProps {
  courses: ICourse[];
  isFetching: boolean;
  onCoursePress: (course: ICourse) => void;
}

interface ICourseListState {
  initialIndex: number;
}

export default class CourseList extends React.PureComponent<ICourseListProps, ICourseListState> {
  constructor(props: ICourseListProps) {
    super(props);

    this.state = {
      initialIndex: this.getCurrentCourseIndex(props.courses),
    };
  }

  componentDidUpdate(prevProps: ICourseListProps) {
    const { courses } = this.props;

    if (prevProps.courses.length !== courses.length) {
      this.setState({ initialIndex: this.getCurrentCourseIndex(courses) });
    }
  }

  private getCurrentCourseIndex(courses: ICourse[]): number {
    const now = moment();
    let index = courses.findIndex(course => course.startDate.clone().subtract(15, 'minutes').isAfter(now)) - 1;

    if (index === -2) index = courses.length - 1;
    return Math.max(index, 0);
  }

  public render() {
    const { isFetching, courses } = this.props;
    return (
      <View>
        <SmallBoldText style={styles.dateText}>
          {I18n.get('presences-courselist-date', { date: moment().format('DD MMMM YYYY') })}
        </SmallBoldText>
        <View style={styles.renderContainer}>
          {isFetching ? (
            <LoadingIndicator />
          ) : courses.length ? (
            <Swiper
              horizontal
              index={this.state.initialIndex}
              dot={<View style={styles.carouselDot} />}
              activeDotStyle={styles.carouselActiveDot}
              paginationStyle={styles.carouselPagination}
              containerStyle={styles.carouselFooter}>
              {courses.map(item => (
                <CallCard key={item.id} course={item} showStatus onPress={() => this.props.onCoursePress(item)} />
              ))}
            </Swiper>
          ) : (
            <>
              <View style={[styles.noCallChip, styles.absentColor]} />
              <BodyBoldText style={styles.noCallText}>{I18n.get('presences-courselist-emptyscreen-title')}</BodyBoldText>
              <View style={[styles.noCallChip, styles.presentColor]} />
            </>
          )}
        </View>
      </View>
    );
  }
}
