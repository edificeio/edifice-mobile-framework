/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const EventTarget = require('event-target-shim');
const Blob = require('Blob');
const {FileReaderModule} = require('NativeModules');

type ReadyState =
  | 0 // EMPTY
  | 1 // LOADING
  | 2; // DONE

type ReaderResult = string | ArrayBuffer;

const READER_EVENTS = [
  'abort',
  'error',
  'load',
  'loadstart',
  'loadend',
  'progress',
];

const EMPTY = 0;
const LOADING = 1;
const DONE = 2;

export default class MyFileReader extends EventTarget(...READER_EVENTS) {
  static EMPTY = EMPTY;
  static LOADING = LOADING;
  static DONE = DONE;

  _readyState: ReadyState = EMPTY;
  _error: Error | null = null;
  _result: ReaderResult | null = null;
  _aborted: boolean = false;
  _subscriptions: Array<any> = [];

  constructor() {
    super();
    this._reset();
  }

  _reset(): void {
    this._readyState = EMPTY;
    this._error = null;
    this._result = null;
  }

  _clearSubscriptions(): void {
    this._subscriptions.forEach(sub => sub.remove());
    this._subscriptions = [];
  }

  _setReadyState(newState: ReadyState) {
    this._readyState = newState;
    this.dispatchEvent({type: 'readystatechange'});
    if (newState === DONE) {
      if (this._aborted) {
        this.dispatchEvent({type: 'abort'});
      } else if (this._error) {
        this.dispatchEvent({type: 'error'});
      } else {
        this.dispatchEvent({type: 'load'});
      }
      this.dispatchEvent({type: 'loadend'});
    }
  }

  readAsArrayBuffer(blob: any) {
      if (this.readyState === this.LOADING) throw new Error("InvalidStateError");
      this._setReadyState(this.LOADING);
      this._result = null;
      this._error = null;
      const fr = new MyFileReader();
      fr.onloadend = () => {
        const content = _atob(fr._result.substr(fr._result.indexOf(";base64,") + 1));
        const buffer = new ArrayBuffer(content.length);
        const view = new Uint8Array(buffer);
 //       const view = new Uint8Array(content.length);
        view.set(Array.from(content).map(c => c.charCodeAt(0)));
        this._result = view.buffer;
        this._setReadyState(this.DONE);
        this.onloadend();
      };
      fr.readAsDataURL(blob);
  }

  readAsDataURL(blob: Blob) {
    this._aborted = false;

    FileReaderModule.readAsDataURL(blob._data).then(
      (text: string) => {
        if (this._aborted) {
          return;
        }
        this._result = text;
        this._setReadyState(DONE);
      },
      (error:any) => {
        if (this._aborted) {
          return;
        }
        this._error = error;
        this._setReadyState(DONE);
      },
    );
  }

  readAsText(blob: Blob, encoding: string = 'UTF-8') {
    this._aborted = false;

    FileReaderModule.readAsText(blob._data, encoding).then(
      (text: string) => {
        if (this._aborted) {
          return;
        }
        this._result = text;
        this._setReadyState(DONE);
      },
      (error:any) => {
        if (this._aborted) {
          return;
        }
        this._error = error;
        this._setReadyState(DONE);
      },
    );
  }

  abort() {
    this._aborted = true;
    // only call onreadystatechange if there is something to abort, as per spec
    if (this._readyState !== EMPTY && this._readyState !== DONE) {
      this._reset();
      this._setReadyState(DONE);
    }
    // Reset again after, in case modified in handler
    this._reset();
  }

  get readyState(): ReadyState {
    return this._readyState;
  }

  get error(): Error | null {
    return this._error;
  }

  get result(): ReaderResult | null{
    return this._result;
  }
}

// from: https://stackoverflow.com/questions/42829838/react-native-atob-btoa-not-working-without-remote-js-debugging
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const _atob = (input = '') => {
  let str = input.replace(/=+$/, '');
  let output = '';

  if (str.length % 4 == 1) {
    throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  for (let bc = 0, bs = 0, buffer, i = 0;
       buffer = str.charAt(i++);

       ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
       bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    buffer = chars.indexOf(buffer);
  }

  return output;
}
