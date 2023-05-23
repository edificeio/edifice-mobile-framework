import * as React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import Toast from '~/framework/components/toast';

const styles = StyleSheet.create({
  clearAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 14,
    height: 14,
    backgroundColor: theme.palette.grey.grey,
    borderRadius: 7,
  },
  clearContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingLeft: UI_SIZES.spacing.minor,
    paddingRight: UI_SIZES.spacing.small,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: UI_SIZES.dimensions.height.largePlus,
    margin: UI_SIZES.spacing.small,
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.large,
  },
  searchIcon: {
    marginLeft: UI_SIZES.spacing.small,
    marginRight: UI_SIZES.spacing.minor,
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingTop: 0, // fixes android alignement
    paddingBottom: 0,
    color: theme.ui.text.regular,
  },
});

interface MailListSearchbarProps {
  query: string;
  onChangeQuery: (value: string) => void;
  onSearch: () => void;
}

export const MailListSearchbar = (props: MailListSearchbarProps) => {
  const inputRef = React.useRef<TextInput>(null);

  const focusInput = () => inputRef.current?.focus();

  const searchMails = () => {
    const { query } = props;

    if (query.length > 0 && query.length < 3) {
      return Toast.showError(I18n.get('zimbra-search-length-error'));
    }
    props.onSearch();
  };

  const clearSearch = () => props.onChangeQuery('');

  return (
    <TouchableOpacity onPress={focusInput} activeOpacity={1} style={styles.container}>
      <Picture type="NamedSvg" name="ui-search" width={18} height={18} fill={theme.ui.text.regular} style={styles.searchIcon} />
      <TextInput
        ref={inputRef}
        value={props.query}
        onChangeText={props.onChangeQuery}
        onSubmitEditing={searchMails}
        placeholder={I18n.get('common.search')}
        placeholderTextColor={theme.ui.text.regular}
        autoCapitalize="none"
        autoCorrect={false}
        inputMode="search"
        returnKeyType="search"
        style={styles.textInput}
      />
      {props.query.length ? (
        <TouchableOpacity onPress={clearSearch} style={styles.clearContainer}>
          <View style={styles.clearAction}>
            <Picture type="NamedSvg" name="ui-close" width={8} height={8} fill={theme.ui.text.inverse} />
          </View>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
};
