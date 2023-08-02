import UserProfileScreen, { computeNavBar } from './screen';
import { ProfileScreenNavigationParams } from './types';

export { computeNavBar };
export type { ProfileScreenNavigationParams };
export default UserProfileScreen;

export const hobbiesItems = ['animals', 'books', 'cinema', 'music', 'places', 'sport'];

export const renderEmoji = {
  ['sport']: '🏆',
  ['cinema']: '🎬',
  ['animals']: '🐼',
  ['music']: '🎼',
  ['places']: '🌏',
  ['books']: '📚',
};
