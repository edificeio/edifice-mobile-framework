import { Error } from "~/framework/util/error";

/**
 * HTTPError class that is Response-like but with additional error properties.
 */
export class HTTPError extends global.Error implements Response, Error.WithCode<FetchErrorCode> {
  public readonly code: FetchErrorCode = FetchErrorCode.NOT_OK;
  constructor(private response: Response, message?: string, options?: ErrorOptions) {
    super(message ?? `[HTTP] Error ${response.status}:  ${response.statusText}`, options);
    this.name = 'HTTPError';
    this.headers = response.headers;
    this.ok = response.ok;
    this.redirected = response.redirected;
    this.status = response.status;
    this.statusText = response.statusText;
    this.type = response.type;
    this.url = response.url;
    this.body = response.body;
    this.bodyUsed = response.bodyUsed;
  }
  headers: Headers;
  ok: boolean;
  redirected: boolean;
  status: number;
  statusText: string;
  type: ResponseType;
  url: string;
  body: ReadableStream<Uint8Array> | null;
  bodyUsed: boolean;
  clone(): Response {
    return new HTTPError(this.response.clone(), this.message);
  }
  arrayBuffer(): Promise<ArrayBuffer> {
    return this.response.arrayBuffer();
  }
  blob(): Promise<Blob> {
    return this.response.blob();
  }
  formData(): Promise<FormData> {
    return this.response.formData();
  }
  json(): Promise<any> {
    return this.response.json();
  }
  text(): Promise<string> {
    return this.response.text();
  }
}

export enum FetchErrorCode {
  /** Server is unreachable or not responding */
  NETWORK_ERROR = 'FetchErrorCode|NETWORK_ERROR',
  /** Request timed out client side */
  TIMEOUT = 'FetchErrorCode|TIMEOUT',
  /** Response is not valid JSON */
  PARSE_ERROR = 'FetchErrorCode|PARSE_ERROR',
  /** Given response is missing data */
  BAD_RESPONSE = 'FetchErrorCode|BAD_RESPONSE',
  /** Active account mandatory but no provided */
  NOT_LOGGED = 'FetchErrorCode|NOT_LOGGED',
  /** HTTP status != 2xx */
  NOT_OK = 'FetchErrorCode|NOT_OK',
}

/**
 * Represents a generic error that occurs during a fetch operation.
 * 
 * @param code - The error code associated with the fetch error.
 * @param args - Additional arguments passed to the `Error` constructor.
 * 
 * @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
 */
export class FetchError extends global.Error implements Error.WithCode<FetchErrorCode> {
  constructor(public readonly code: FetchErrorCode, ...args: ConstructorParameters<typeof global.Error>) {
    super(...args);
    this.name = 'FetchError'; // Note: built-in Error class break the prototype chain when extending it like this...
    Object.setPrototypeOf(this, new.target.prototype); // ... So, we need to restore the prototype chain like this.
    // @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
  }
}
