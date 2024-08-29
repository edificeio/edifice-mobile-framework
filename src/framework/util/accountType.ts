import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { AccountType } from '~/framework/modules/auth/model';

export const accountTypeInfos = {
  [AccountType.Student]: {
    text: I18n.get('user-profiletypes-student'),
    color: theme.palette.complementary.orange,
    icon: 'ui-backpack',
  },
  [AccountType.Teacher]: {
    text: I18n.get('user-profiletypes-teacher'),
    color: theme.palette.complementary.green,
    icon: 'ui-teacher',
  },
  [AccountType.Relative]: {
    text: I18n.get('user-profiletypes-relative'),
    color: theme.palette.complementary.blue,
    icon: 'ui-cottage',
  },
  [AccountType.Personnel]: {
    text: I18n.get('user-profiletypes-personnel'),
    color: theme.palette.complementary.purple,
    icon: 'ui-environment',
  },
  [AccountType.Guest]: {
    text: I18n.get('user-profiletypes-guest'),
    color: theme.palette.complementary.red,
    icon: 'ui-personBook',
  },
};
