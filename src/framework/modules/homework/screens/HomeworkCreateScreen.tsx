import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import DayPicker from '~/framework/components/daypicker';
import InputContainer from '~/framework/components/inputs/container';
import { LabelIndicator } from '~/framework/components/inputs/container/label';
import { PageView } from '~/framework/components/page';

import { HomeworkNavigationParams, homeworkRouteNames } from '~/framework/modules/homework/navigation';
import { AttachmentPicker } from '~/ui/AttachmentPicker';
import moduleConfig from '~/framework/modules/homework/module-config';
import { uppercaseFirstLetter } from '~/framework/util/string';

export interface IHomeworkCreateScreenNavigationParams {}

export type IHomeworkCreateScreenProps = NativeStackScreenProps<HomeworkNavigationParams, typeof homeworkRouteNames.homeworkCreate>;

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: UI_SIZES.spacing.big,
  },
  page: {
    backgroundColor: theme.ui.background.card,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
  },
});

export class HomeworkCreateScreen extends React.PureComponent<IHomeworkCreateScreenProps, object> {
  state = {
    date: 'defaultdate',
    subject: '',
    description: '',
    images: [],
  };

  render() {
    const { images } = this.state;

    return (
      <PageView style={styles.page}>
        <InputContainer
          label={{ text: I18n.get('homework-create-date-title'), icon: 'ui-calendarLight', indicator: LabelIndicator.REQUIRED }}
          input={<DayPicker onDateChange={date => this.setState({ date })} />}
        />
        <View style={styles.inputContainer}>
          <AttachmentPicker
            onlyImages
            notifierId={uppercaseFirstLetter(moduleConfig.name)}
            imageCallback={image => this.setState(prevState => ({ images: [...prevState.images, image] }))}
            onAttachmentRemoved={images => this.setState({ images })}
            attachments={images.map(image => ({
              mime: image.type,
              name: image.fileName,
              uri: image.uri,
            }))}
          />
        </View>
      </PageView>
    );
  }
}

export default HomeworkCreateScreen;
