const CONTENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Same check as the `h5p` node of the web editor: the content id is the only value read from the page HTML. */
export const isH5PContentId = (value: unknown): value is string => typeof value === 'string' && CONTENT_ID_PATTERN.test(value);

export const h5pEmbedPath = (contentId: string) => `/h5p/embed/${encodeURIComponent(contentId)}`;
