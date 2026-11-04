import { menuAction, menuSubmenu } from './items';
import { findMenuAction, toMenuViewActions, toNativeMenu } from './menu';

const share = jest.fn();
const remove = jest.fn();
const copy = jest.fn();

const items = [
  menuAction({
    icon: { android: 'ic_share', ios: { name: 'square.and.arrow.up', type: 'sfSymbol' } },
    label: 'Share',
    onPress: share,
    testID: 'share',
  }),
  menuSubmenu({
    description: 'More actions',
    inline: true,
    items: [
      menuAction({ label: 'Copy', onPress: copy, state: 'on', testID: 'copy' }),
      menuAction({ destructive: true, disabled: true, label: 'Delete', onPress: remove, testID: 'delete' }),
    ],
    label: 'More',
    testID: 'more',
  }),
];

const colors = { destructive: 'red', regular: 'black' };

describe('toMenuViewActions', () => {
  it('identifies each entry by its testID, with its icon of the platform', () => {
    const [shareAction, more] = toMenuViewActions(items, 'android', colors);
    expect(shareAction).toMatchObject({ id: 'share', image: 'ic_share', imageColor: 'black', title: 'Share' });
    expect(more).toMatchObject({ displayInline: true, id: 'more', subtitle: 'More actions', title: 'More' });
    expect(toMenuViewActions(items, 'ios', colors)[0].image).toBe('square.and.arrow.up');
  });

  it('keeps the submenus, the states and the attributes', () => {
    const [, more] = toMenuViewActions(items, 'android', colors);
    expect(more.subactions).toEqual([
      expect.objectContaining({ id: 'copy', state: 'on' }),
      expect.objectContaining({
        attributes: { destructive: true, disabled: true, hidden: undefined },
        id: 'delete',
        imageColor: 'red',
      }),
    ]);
  });
});

describe('findMenuAction', () => {
  it('finds the entry pressed, in the submenus too', () => {
    expect(findMenuAction(items, 'share')?.onPress).toBe(share);
    expect(findMenuAction(items, 'delete')?.onPress).toBe(remove);
    expect(findMenuAction(items, 'more')).toBeUndefined();
    expect(findMenuAction(items, 'unknown')).toBeUndefined();
  });
});

describe('toNativeMenu', () => {
  it('gives the native icons of iOS, the iOS fields and the title', () => {
    const menu = toNativeMenu({
      ios: { layout: 'palette' },
      items,
      label: 'Menu',
      testID: 'menu',
      title: 'Title',
      type: 'menu',
    });
    expect(menu).toMatchObject({ layout: 'palette', title: 'Title' });
    expect(menu.items[0]).toMatchObject({
      icon: { name: 'square.and.arrow.up', type: 'sfSymbol' },
      label: 'Share',
      type: 'action',
    });
    expect(menu.items[1]).toMatchObject({ inline: true, items: [{ label: 'Copy' }, { destructive: true, label: 'Delete' }] });
  });
});
