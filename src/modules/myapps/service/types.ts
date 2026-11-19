/**
 * Formats of the API of « Mes applis ». They don't leave `service/`: the service gives types of the model (see `adapter.ts`).
 */
export namespace API {
  /** An entry of `GET /api/me/applications`: the fields of `/applications-list` and of `/myApps/config`, plus `appName`. */
  export interface EntAppResponse {
    /** Identifier (« Actualites »). */
    name: string;
    /** « /actualites », or an absolute URL for a connector. */
    address: string;
    /** « actualites-large ». */
    icon: string;
    /** « » or « _blank ». */
    target?: string | null;
    /** « actualites »: a key, not a label (not used: see `appName`). */
    displayName: string;
    /** « Actualités »: the label, translated by the server in the language of the request (`Accept-Language`). */
    appName: string;
    display: boolean;
    /** « /actualites »; missing or empty for a connector. */
    prefix?: string | null;
    casType?: string | null;
    scope?: string[];
    /** Ignored, as the web client does. */
    isExternal?: boolean;
    /** « communication » | « pedagogy » | « organisation » | … */
    category?: string;
    /** Key of `theme.palette.complementary` (« orange »). */
    color?: string;
    /** Ignored, as the web client does: the libraries are detected by their address (see `model/classification.ts`). */
    libraries?: boolean;
    /** Language → URL of the help. */
    help?: Record<string, string | null>;
  }

  /** `GET /userbook/preference/apps`. */
  export interface PreferencesResponse {
    /** JSON of `Preferences`. */
    preference?: string | null;
  }

  /** Preferences of the user about the apps, as the server keeps them. */
  export interface Preferences {
    applications?: string[];
    /** The favorites. */
    bookmarks?: string[];
  }
}
