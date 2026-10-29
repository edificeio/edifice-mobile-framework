import { useNavigation } from '@react-navigation/native';

import { openIntent } from '~/app/intents';
import toast from '~/framework/components/toast';
import { openUrl } from '~/framework/util/linking';
import { type FileMedia, type LinkMedia, MediaType, type ResourceMedia } from '~/modules/media/types';
import { renderHook } from '~/test-utils/render-hook';

import { useOpenMedia } from './open-media';

jest.mock('~/modules/media/mime', () => ({ mimeCompare: jest.fn() }));
jest.mock('~/app/intents', () => ({ INTENT_TYPE: { OPEN_RESOURCE: 'OPEN_RESOURCE' }, openIntent: jest.fn() }));
jest.mock('~/framework/components/toast', () => ({ __esModule: true, default: { showError: jest.fn() } }));
jest.mock('~/framework/util/linking', () => ({ openUrl: jest.fn() }));

const image = (name: string): FileMedia => ({ mime: 'image/png', name, src: `/img/${name}`, type: MediaType.IMAGE });
const link: LinkMedia = { src: 'https://elsewhere.test', type: MediaType.LINK };
const resource: ResourceMedia = { appName: 'Blog', resourceId: 'r1', src: '/blog/r1', type: MediaType.RESOURCE };

const setup = () => {
  const navigation = { navigate: jest.fn() };
  jest.mocked(useNavigation).mockReturnValue(navigation);
  return { navigation, ...renderHook(useOpenMedia).result.current };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('openPdf', () => {
  it('opens the carousel on the pdf, with its title', () => {
    const { navigation, openPdf } = setup();
    openPdf({ src: '/terms.pdf', title: 'Terms' });
    expect(navigation.navigate).toHaveBeenCalledWith('media/carousel', {
      media: [{ mime: 'application/pdf', src: '/terms.pdf', type: MediaType.ATTACHMENT }],
      startIndex: 0,
      title: 'Terms',
    });
  });
});

describe('openMedias', () => {
  it('opens the carousel on the files of the list, from the one that was touched', () => {
    const { navigation, openMedias } = setup();
    const [a, b] = [image('a'), image('b')];
    openMedias([a, link, b], 2);
    expect(navigation.navigate).toHaveBeenCalledWith('media/carousel', { media: [a, b], startIndex: 1 });
  });

  it('opens a link in the browser', () => {
    const { navigation, openMedias } = setup();
    openMedias([link], 0);
    expect(openUrl).toHaveBeenCalledWith('https://elsewhere.test');
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('opens a resource in its app', () => {
    const { openMedias } = setup();
    openMedias([resource], 0);
    expect(openIntent).toHaveBeenCalledWith('Blog', 'OPEN_RESOURCE', { id: 'r1', url: '/blog/r1' });
  });

  it('tells the user when there is no media at the index', () => {
    const { navigation, openMedias } = setup();
    openMedias([image('a')], 3);
    openMedias([], 0);
    expect(toast.showError).toHaveBeenCalledTimes(2);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});

describe('openMedia', () => {
  it('opens one media', () => {
    const { navigation, openMedia } = setup();
    const a = image('a');
    openMedia(a);
    expect(navigation.navigate).toHaveBeenCalledWith('media/carousel', { media: [a], startIndex: 0 });
  });
});
