import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { Text, TextBold, TextSizeStyle } from '~/framework/components/text';
import { Homework } from '~/modules/viescolaire/utils/cdt';
import { LeftColoredItem } from '~/modules/viescolaire/viesco/components/Item';
import { INavigationProps } from '~/types';
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
    paddingVertical: 8, // MO-142 use UI_SIZES.spacing here
    paddingHorizontal: 15, // MO-142 use UI_SIZES.spacing here
  },
  title: {
    ...TextSizeStyle.SlightBig,
  },
  subtitle: {
    color: theme.palette.grey.stone,
    marginBottom: 15, // MO-142 use UI_SIZES.spacing here
  },
  course: {
    textTransform: 'uppercase',
    marginLeft: 8, // MO-142 use UI_SIZES.spacing here
  },
});

type IDisplayHomeworkProps = {
  homework: Homework;
  homeworkList: Homework[];
} & INavigationProps;

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
              <LeftColoredItem shadow style={style.LeftColoredItemInfoBar} color="#FA9700">
                {homeworkList && homeworkList[indexSelectedHomework]?.created_date ? (
                  <>
                    <Icon size={20} color="#FA9700" name="date_range" />
                    <Text>&emsp;{moment(homeworkList[indexSelectedHomework].created_date).format('DD/MM/YY')}</Text>
                  </>
                ) : null}
                {homeworkList && homeworkList[indexSelectedHomework]?.subject ? (
                  <TextBold style={style.course}>{homeworkList[indexSelectedHomework].subject}</TextBold>
                ) : null}
              </LeftColoredItem>
            </View>

            <ScrollView>
              <View style={style.homeworkPart}>
                <TextBold style={style.title}>{I18n.t('viesco-homework-home')}</TextBold>
                {homeworkList && homeworkList[indexSelectedHomework]?.due_date && (
                  <Text style={style.subtitle}>
                    {I18n.t('viesco-homework-fordate')}{' '}
                    {moment(homeworkList[indexSelectedHomework].due_date).format('Do MMMM YYYY')}
                  </Text>
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
