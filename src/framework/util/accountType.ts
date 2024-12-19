import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { AccountType } from '~/framework/modules/auth/model';

export const accountTypeInfos = {
  [AccountType.Student]: {
    color: theme.palette.complementary.orange,
    icon: 'ui-backpack',
    text: I18n.get('user-profiletypes-student'),
  },
  [AccountType.Teacher]: {
    color: theme.palette.complementary.green,
    icon: 'ui-teacher',
    text: I18n.get('user-profiletypes-teacher'),
  },
  [AccountType.Relative]: {
    color: theme.palette.complementary.blue,
    icon: 'ui-cottage',
    text: I18n.get('user-profiletypes-relative'),
  },
  [AccountType.Personnel]: {
    color: theme.palette.complementary.purple,
    icon: 'ui-environment',
    text: I18n.get('user-profiletypes-personnel'),
  },
  [AccountType.Guest]: {
    color: theme.palette.complementary.red,
    icon: 'ui-personBook',
    text: I18n.get('user-profiletypes-guest'),
  },
};
