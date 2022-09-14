import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { NavigationInjectedProps } from 'react-navigation';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { BodyBoldText, SmallBoldText, SmallText } from '~/framework/components/text';
import { Homework } from '~/modules/viescolaire/utils/cdt';
import { LeftColoredItem } from '~/modules/viescolaire/viesco/components/Item';
import { PageContainer } from '~/ui/ContainerContent';
import { HtmlContentView } from '~/ui/HtmlContentView';

const style = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  homeworkInfoBar: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  LeftColoredItemInfoBar: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  homeworkPart: {
    paddingVertical: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  subtitle: {
    color: theme.palette.grey.stone,
    marginBottom: UI_SIZES.spacing.medium,
  },
  course: {
    textTransform: 'uppercase',
    marginLeft: UI_SIZES.spacing.minor,
  },
});

type IDisplayHomeworkProps = {
  homework: Homework;
  homeworkList: Homework[];
} & NavigationInjectedProps;

type IDisplayHomeworkState = {
  indexSelectedHomework: number;
  isRemovedDescription: boolean; // this variable is used to reset the description list in the <HtmlContentView /> component when the homeworkList is updated
};

export default class DisplayHomework extends React.PureComponent<IDisplayHomeworkProps, IDisplayHomeworkState> {
  constructor(props) {
    super(props);

    this.state = {
      indexSelectedHomework: 0,
      isRemovedDescription: true,
    };
  }

  componentDidMount() {
    const { homeworkList } = this.props;

    if (homeworkList && homeworkList.length === 1) {
      this.setState({ indexSelectedHomework: 0, isRemovedDescription: false });
    } else if (homeworkList) {
      const index = homeworkList.findIndex(item =>
        this.state.indexSelectedHomework
          ? item.id === homeworkList[this.state.indexSelectedHomework].id
          : item.id === this.props.homework.id,
      );
      this.setState({ indexSelectedHomework: index, isRemovedDescription: false });
    }
  }

  componentDidUpdate(prevProps) {
    const { homeworkList } = this.props;

    if (homeworkList && homeworkList.length === 1) {
      this.setState({ indexSelectedHomework: 0, isRemovedDescription: false });
    } else if (this.props.homeworkList && prevProps.homeworkList !== this.props.homeworkList) {
      const index = homeworkList.findIndex(item =>
        this.state.indexSelectedHomework
          ? item.id === homeworkList[this.state.indexSelectedHomework].id
          : item.id === this.props.homework.id,
      );
      this.setState({ indexSelectedHomework: index });
    } else if (this.state.isRemovedDescription) {
      this.setState({ isRemovedDescription: false });
    }
  }

  public onHomeworkChange = (selectedIndex: number) => {
    this.setState({ indexSelectedHomework: selectedIndex, isRemovedDescription: true });
  };

  public handleStateChange = ({ nativeEvent }) => {
    const { homeworkList } = this.props;
    const { indexSelectedHomework } = this.state;

    if (homeworkList !== undefined) {
      if (nativeEvent.state === State.END) {
        if (nativeEvent.translationX < 0 && indexSelectedHomework < homeworkList.length - 1) {
          this.onHomeworkChange(indexSelectedHomework + 1);
        } else if (nativeEvent.translationX > 0 && indexSelectedHomework > 0) {
          this.onHomeworkChange(indexSelectedHomework - 1);
        }
      }
    }
  };

  public render() {
    const { homeworkList } = this.props;
    const { indexSelectedHomework, isRemovedDescription } = this.state;
    const htmlOpts = {
      selectable: true,
    };

    return (
      <PageContainer>
        <PanGestureHandler onHandlerStateChange={this.handleStateChange}>
          <View style={style.mainView}>
            <View style={style.homeworkInfoBar}>
              <LeftColoredItem shadow style={style.LeftColoredItemInfoBar} color={theme.palette.complementary.orange.regular}>
                {homeworkList && homeworkList[indexSelectedHomework]?.created_date ? (
                  <>
                    <Icon size={20} color={theme.palette.complementary.orange.regular} name="date_range" />
                    <SmallText>&emsp;{moment(homeworkList[indexSelectedHomework].created_date).format('DD/MM/YY')}</SmallText>
                  </>
                ) : null}
                {homeworkList && homeworkList[indexSelectedHomework]?.subject ? (
                  <SmallBoldText style={style.course}>{homeworkList[indexSelectedHomework].subject}</SmallBoldText>
                ) : null}
              </LeftColoredItem>
            </View>

            <ScrollView>
              <View style={style.homeworkPart}>
                <BodyBoldText>{I18n.t('viesco-homework-home')}</BodyBoldText>
                {homeworkList && homeworkList[indexSelectedHomework]?.due_date && (
                  <SmallText style={style.subtitle}>
                    {I18n.t('viesco-homework-fordate')}{' '}
                    {moment(homeworkList[indexSelectedHomework].due_date).format('Do MMMM YYYY')}
                  </SmallText>
                )}
                {!isRemovedDescription && homeworkList && homeworkList[indexSelectedHomework]?.description && (
                  <HtmlContentView html={homeworkList[indexSelectedHomework].description} opts={htmlOpts} />
                )}
              </View>
            </ScrollView>
          </View>
        </PanGestureHandler>
      </PageContainer>
    );
  }
}
