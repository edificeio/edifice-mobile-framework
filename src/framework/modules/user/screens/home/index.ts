import { UserType } from '~/framework/modules/auth/service';
import UserHomeScreen from './screen';
import theme from '~/app/theme';
import appConf from '~/framework/util/appConf';

export default UserHomeScreen;
export { UserHomeScreenNavParams, UserHomeScreenProps } from './types';
export { computeNavBar } from './screen';

export const colorType = {
  [UserType.Student]: theme.palette.complementary.orange.regular,
  [UserType.Relative]: theme.palette.complementary.blue.regular,
  [UserType.Teacher]: theme.palette.complementary.green.regular,
  [UserType.Guest]: appConf.is1d ? theme.palette.complementary.red.regular : theme.palette.complementary.pink.regular,
  [UserType.Personnel]: theme.palette.complementary.purple.regular,
};
