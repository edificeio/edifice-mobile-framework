import theme from '~/app/override/theme';
import { AccountType } from '~/framework/modules/auth/model';

export const accountTypeColors = {
  [AccountType.Teacher]: theme.palette.complementary.green.regular,
  [AccountType.Student]: theme.palette.complementary.orange.regular,
  [AccountType.Relative]: theme.palette.complementary.blue.regular,
  [AccountType.Personnel]: theme.palette.complementary.purple.regular,
  [AccountType.Guest]: theme.palette.complementary.red.regular,
};
