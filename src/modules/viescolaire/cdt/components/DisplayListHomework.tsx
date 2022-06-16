import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { Text, TextBold, TextSizeStyle } from '~/framework/components/text';
import { Homework } from '~/modules/viescolaire/utils/cdt';
import { LeftColoredItem } from '~/modules/viescolaire/viesco/components/Item';
import { PageContainer } from '~/ui/ContainerContent';
import { HtmlContentView } from '~/ui/HtmlContentView';

const style = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  homeworksInfoBar: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  LeftColoredItemInfoBar: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  homeworkPart: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  title: {
    ...TextSizeStyle.SlightBig,
  },
  homeworksView: {
    marginBottom: 40,
  },
  homeworkType: {
    ...TextSizeStyle.SlightBig,
    marginTop: 15,
  },
  subtitle: {
    color: theme.palette.grey.stone,
    marginBottom: 15,
  },
  course: {
    textTransform: 'uppercase',
    marginLeft: 8,
  },
});

type IDisplayListHomeworkProps = {
  subject: string;
  homeworkList: Homework[];
};

export default class DisplayListHomework extends React.PureComponent<IDisplayListHomeworkProps> {
  public render() {
    const { subject, homeworkList } = this.props;
    const htmlOpts = {
      selectable: true,
    };

    return (
      <PageContainer>
        <View style={style.mainView}>
          <View style={style.homeworksInfoBar}>
            <LeftColoredItem shadow style={style.LeftColoredItemInfoBar} color="#FA9700">
              {homeworkList && homeworkList[0]?.due_date ? (
                <>
                  <Icon size={20} color="#FA9700" name="date_range" />
                  <Text>&emsp;{moment(homeworkList[0].due_date).format('DD/MM/YY')}</Text>
                </>
              ) : null}
              {subject ? <TextBold style={style.course}>{subject}</TextBold> : null}
            </LeftColoredItem>
          </View>

          <View style={style.homeworkPart}>
            <TextBold style={style.title}>{I18n.t('viesco-homework-home')}</TextBold>
            <FlatList
              data={homeworkList}
              renderItem={({ item }) => (
                <View style={style.homeworksView}>
                  {item?.type && <TextBold style={style.homeworkType}>{item?.type}</TextBold>}
                  {item && item?.subject && (
                    <Text style={style.subtitle}>
                      {item.subject.charAt(0).toLocaleUpperCase() + item.subject.substring(1).toLocaleLowerCase()} -{' '}
                      {item?.audience}
                    </Text>
                  )}
                  {this.props.homeworkList && item?.description && <HtmlContentView html={item.description} opts={htmlOpts} />}
                </View>
              )}
            />
          </View>
        </View>
      </PageContainer>
    );
  }
}
