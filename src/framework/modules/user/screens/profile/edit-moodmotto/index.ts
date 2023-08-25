import UserEditMoodMottoScreen, { computeNavBar } from './screen';
import { UserEditMoodMottoScreenNavParams } from './types';

export default UserEditMoodMottoScreen;
export { computeNavBar };
export type { UserEditMoodMottoScreenNavParams };

export const renderMoodPicture = {
  '1d': {
    angry: require('ASSETS/images/moods/1d/angry.png'),
    dreamy: require('ASSETS/images/moods/1d/dreamy.png'),
    happy: require('ASSETS/images/moods/1d/happy.png'),
    joker: require('ASSETS/images/moods/1d/joker.png'),
    love: require('ASSETS/images/moods/1d/love.png'),
    default: require('ASSETS/images/moods/1d/none.png'),
    proud: require('ASSETS/images/moods/1d/proud.png'),
    sad: require('ASSETS/images/moods/1d/sad.png'),
    sick: require('ASSETS/images/moods/1d/sick.png'),
    tired: require('ASSETS/images/moods/1d/tired.png'),
    worried: require('ASSETS/images/moods/1d/worried.png'),
  },
  '2d': {
    angry: require('ASSETS/images/moods/2d/angry.png'),
    dreamy: require('ASSETS/images/moods/2d/dreamy.png'),
    happy: require('ASSETS/images/moods/2d/happy.png'),
    joker: require('ASSETS/images/moods/2d/joker.png'),
    love: require('ASSETS/images/moods/2d/love.png'),
    default: require('ASSETS/images/moods/2d/none.png'),
    proud: require('ASSETS/images/moods/2d/proud.png'),
    sad: require('ASSETS/images/moods/2d/sad.png'),
    sick: require('ASSETS/images/moods/2d/sick.png'),
    tired: require('ASSETS/images/moods/2d/tired.png'),
    worried: require('ASSETS/images/moods/2d/worried.png'),
  },
};
