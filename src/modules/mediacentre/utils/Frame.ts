export interface Frame {
  status: string;
  toJSON(): string;
}

export class Frame {
  private readonly _event: string;
  private readonly _state: string;
  private readonly _sources: string[];
  private readonly _data: any;

  constructor(event: string, state: string, sources: string[], data: any) {
    this._event = event;
    this._state = state;
    this._sources = sources;
    this._data = data;
  }

  toJSON(): string {
    return JSON.stringify({
      event: this._event,
      state: this._state,
      sources: this._sources,
      data: this._data,
    });
  }

  get data() {
    return this._data;
  }

  get state() {
    return this._state;
  }

  get event() {
    return this._event;
  }

  get sources() {
    return this._sources;
  }
}
