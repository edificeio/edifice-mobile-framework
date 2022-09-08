import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallBoldText, SmallText, TextSizeStyle } from '~/framework/components/text';
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
    paddingVertical: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  title: {
    ...TextSizeStyle.Medium,
  },
  homeworksView: {
    marginBottom: UI_SIZES.spacing.large,
  },
  homeworkType: {
    ...TextSizeStyle.Medium,
    marginTop: UI_SIZES.spacing.medium,
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
                  <SmallText>&emsp;{moment(homeworkList[0].due_date).format('DD/MM/YY')}</SmallText>
                </>
              ) : null}
              {subject ? <SmallBoldText style={style.course}>{subject}</SmallBoldText> : null}
            </LeftColoredItem>
          </View>

          <View style={style.homeworkPart}>
            <SmallBoldText style={style.title}>{I18n.t('viesco-homework-home')}</SmallBoldText>
            <FlatList
              data={homeworkList}
              renderItem={({ item }) => (
                <View style={style.homeworksView}>
                  {item?.type && <SmallBoldText style={style.homeworkType}>{item?.type}</SmallBoldText>}
                  {item && item?.subject && (
                    <SmallText style={style.subtitle}>
                      {item.subject.charAt(0).toLocaleUpperCase() + item.subject.substring(1).toLocaleLowerCase()} -{' '}
                      {item?.audience}
                    </SmallText>
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
