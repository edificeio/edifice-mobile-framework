import { useNavigation } from '@react-navigation/native';

import { useUserAvailableModules } from '~/app/module';
import toast from '~/framework/components/toast';
import { openUrl } from '~/framework/util/linking';
import { type FileMedia, type LinkMedia, MediaType, type ResourceMedia } from '~/modules/media/types';
import { renderHook } from '~/test-utils/render-hook';

import { useOpenMedia } from './open-media';

jest.mock('~/modules/media/mime', () => ({ mimeCompare: jest.fn() }));
jest.mock('~/app/module', () => ({
  getResourceEntry: jest.requireActual('~/app/module/entries').getResourceEntry,
  useUserAvailableModules: jest.fn(),
}));
jest.mock('~/framework/components/toast', () => ({ __esModule: true, default: { showError: jest.fn() } }));
jest.mock('~/framework/util/linking', () => ({ openUrl: jest.fn() }));

const image = (name: string): FileMedia => ({ mime: 'image/png', name, src: `/img/${name}`, type: MediaType.IMAGE });
const link: LinkMedia = { src: 'https://elsewhere.test', type: MediaType.LINK };
const resource: ResourceMedia = { appName: 'Blog', resourceId: 'r1', src: '/blog/r1', type: MediaType.RESOURCE };
const openBlogResource = jest.fn();
const blogModule = { entries: { resource: openBlogResource }, matchEntcoreApp: 'Blog', name: 'blog' };

const setup = () => {
  const navigation = { navigate: jest.fn() };
  jest.mocked(useNavigation).mockReturnValue(navigation);
  jest.mocked(useUserAvailableModules).mockReturnValue([blogModule] as unknown as ReturnType<typeof useUserAvailableModules>);
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

  it('opens a resource with the entry of the module of its app', () => {
    const { navigation, openMedias } = setup();
    openMedias([resource], 0);
    expect(openBlogResource).toHaveBeenCalledWith(resource, navigation);
    expect(openUrl).not.toHaveBeenCalled();
  });

  it('opens in the browser a resource that no module opens', () => {
    const { openMedias } = setup();
    const wikiResource: ResourceMedia = { ...resource, appName: 'Wiki', src: '/wiki/r1' };
    openMedias([wikiResource], 0);
    expect(openUrl).toHaveBeenCalledWith('/wiki/r1');
    expect(openBlogResource).not.toHaveBeenCalled();
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
