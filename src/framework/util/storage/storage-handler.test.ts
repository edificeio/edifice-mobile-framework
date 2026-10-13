import { createFakeStorageLib } from '~/test-utils/fake-storage-lib';

import { StorageHandler } from './storage-handler';

interface Data {
  'a-flag': boolean;
  'a-count': number;
  'a-text': string;
  'an-object': { x: number };
  'nullable-text': string | null;
  'opt-text'?: string;
}

const setup = () => {
  const lib = createFakeStorageLib();
  const handler = new StorageHandler<Data>(lib).setPrefix('ns');
  return { handler, lib };
};

describe('StorageHandler', () => {
  describe('keys', () => {
    it('prefixes the keys with the namespace', () => {
      const { handler, lib } = setup();
      handler.set('a-count', 3);
      handler.set('a-text', 'hello');
      expect(lib.data.get('ns.a-count')).toBe(3);
      expect(lib.data.get('ns.a-text')).toBe('hello');
    });

    it('does not prefix the keys of a handler without namespace', () => {
      const lib = createFakeStorageLib();
      new StorageHandler(lib).set('raw-key', 1);
      expect(lib.data.get('raw-key')).toBe(1);
    });
  });

  describe('values', () => {
    it('stores a boolean as 1 or 0', () => {
      const { handler, lib } = setup();
      handler.set('a-flag', true);
      expect(lib.data.get('ns.a-flag')).toBe(1);
      handler.set('a-flag', false);
      expect(lib.data.get('ns.a-flag')).toBe(0);
    });

    it('reads a boolean back, false included', () => {
      const { handler } = setup();
      handler.set('a-flag', false);
      expect(handler.getBoolean('a-flag')).toBe(false);
      handler.set('a-flag', true);
      expect(handler.getBoolean('a-flag')).toBe(true);
    });

    // It used to be `true`: the readers that relied on it were adapted (see the documentation of `getBoolean`)
    it('reads a boolean that was never stored as undefined', () => {
      const { handler } = setup();
      expect(handler.getBoolean('a-flag')).toBeUndefined();
    });

    it('reads numbers and strings, and undefined when nothing is stored', () => {
      const { handler } = setup();
      expect(handler.getNumber('a-count')).toBeUndefined();
      expect(handler.getString('a-text')).toBeUndefined();
      handler.set('a-count', 0);
      handler.set('a-text', '');
      expect(handler.getNumber('a-count')).toBe(0);
      expect(handler.getString('a-text')).toBe('');
    });

    it('reads optional and nullable keys like the type they hold', () => {
      const { handler } = setup();
      handler.set('opt-text', 'x');
      expect(handler.getString('opt-text')).toBe('x');
      expect(handler.getString('nullable-text')).toBeUndefined();
    });

    it('contains what is stored, until it is removed', () => {
      const { handler } = setup();
      expect(handler.contains('a-count')).toBe(false);
      handler.set('a-count', 1);
      expect(handler.contains('a-count')).toBe(true);
      handler.remove('a-count');
      expect(handler.contains('a-count')).toBe(false);
      expect(handler.getNumber('a-count')).toBeUndefined();
    });
  });

  describe('JSON', () => {
    it('saves an object as JSON and reads it back', () => {
      const { handler, lib } = setup();
      handler.setJSON('an-object', { x: 1 });
      expect(lib.data.get('ns.an-object')).toBe('{"x":1}');
      expect(handler.getJSON('an-object')).toEqual({ x: 1 });
    });

    it('reads undefined when nothing is stored, or undefined was saved', () => {
      const { handler } = setup();
      expect(handler.getJSON('an-object')).toBeUndefined();
      handler.setJSON('an-object', undefined as never);
      expect(handler.getJSON('an-object')).toBeUndefined();
    });

    it('ignores a value that is not valid JSON, and logs it, instead of throwing', () => {
      const { handler, lib } = setup();
      const error = jest.spyOn(console, 'error').mockImplementation(() => {});
      lib.set('ns.an-object', '{not json');
      expect(handler.getJSON('an-object')).toBeUndefined();
      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0]).toContain('an-object');
    });
  });

  describe('getAllKeys', () => {
    it('only gives the keys of the namespace of the storage', () => {
      const lib = createFakeStorageLib();
      const first = new StorageHandler<Data>(lib).setPrefix('first');
      const second = new StorageHandler<Data>(lib).setPrefix('second');
      first.set('a-count', 1);
      first.set('a-text', 'x');
      second.set('a-count', 2);
      expect(first.getAllKeys().sort()).toEqual(['first.a-count', 'first.a-text']);
      expect(second.getAllKeys()).toEqual(['second.a-count']);
    });

    it('gives all the keys of the device for a handler without namespace', () => {
      const lib = createFakeStorageLib();
      new StorageHandler<Data>(lib).setPrefix('first').set('a-count', 1);
      const root = new StorageHandler(lib);
      root.set('loose', 1);
      expect(root.getAllKeys().sort()).toEqual(['first.a-count', 'loose']);
    });
  });

  describe('addOnChangedListener', () => {
    it('calls the listener when its key is set or removed, and only then', () => {
      const { handler } = setup();
      const listener = jest.fn();
      handler.addOnChangedListener('a-count', listener);
      handler.set('a-text', 'other key');
      expect(listener).not.toHaveBeenCalled();
      handler.set('a-count', 1);
      expect(listener).toHaveBeenCalledTimes(1);
      handler.remove('a-count');
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('is not called for the same key of another namespace', () => {
      const lib = createFakeStorageLib();
      const first = new StorageHandler<Data>(lib).setPrefix('first');
      const second = new StorageHandler<Data>(lib).setPrefix('second');
      const listener = jest.fn();
      first.addOnChangedListener('a-count', listener);
      second.set('a-count', 1);
      expect(listener).not.toHaveBeenCalled();
    });

    it('shares one listener of the lib between all the subscribers, until the last one leaves', () => {
      const { handler, lib } = setup();
      expect(lib.listenerCount()).toBe(0);
      const subscriptions = [
        handler.addOnChangedListener('a-count', jest.fn()),
        handler.addOnChangedListener('a-count', jest.fn()),
        handler.addOnChangedListener('a-text', jest.fn()),
      ];
      expect(lib.listenerCount()).toBe(1);
      subscriptions[0].remove();
      subscriptions[1].remove();
      expect(lib.listenerCount()).toBe(1);
      subscriptions[2].remove();
      expect(lib.listenerCount()).toBe(0);
    });

    it('stops calling a listener that was removed, and keeps calling the others', () => {
      const { handler } = setup();
      const removed = jest.fn();
      const kept = jest.fn();
      const subscription = handler.addOnChangedListener('a-count', removed);
      handler.addOnChangedListener('a-count', kept);
      subscription.remove();
      handler.set('a-count', 1);
      expect(removed).not.toHaveBeenCalled();
      expect(kept).toHaveBeenCalledTimes(1);
    });

    it('listens again after everyone left', () => {
      const { handler, lib } = setup();
      handler.addOnChangedListener('a-count', jest.fn()).remove();
      expect(lib.listenerCount()).toBe(0);
      const listener = jest.fn();
      handler.addOnChangedListener('a-count', listener);
      handler.set('a-count', 1);
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
