import { Platform } from 'react-native';

import RNFS from 'react-native-fs';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { getScaleFontSize, getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/redux/reducer';

import { ui } from './const';
import editorScript from './editorScript.rawjs';

const base64Type = {
  FONT: 'fonts',
  IMAGE: 'images',
};

const isIOS = Platform.OS === 'ios';
const pfUrl = getSession()?.platform?.url || '';
const playIconSize = getScaleWidth(40);
const thumbnailSize = Platform.OS === 'ios' ? `${UI_SIZES.standardScreen.width}x0` : '2600x0';

let audioIcon = '';
let attachmentIcon = '';
let playIcon = '';
let fontFaces = '';
let imagePlaceholder = '';

async function loadBase64File(fileName, type) {
  let base64String = '';
  if (Platform.OS === 'android') base64String = await RNFS.readFileAssets(`${type}/${fileName}`, 'base64');
  else base64String = await RNFS.readFile(`${RNFS.MainBundlePath}/${fileName}`, 'base64');
  return base64String;
}

async function loadFont(fontInfo) {
  const { bold, cursive, fontFamily, fontFile, italic } = fontInfo;
  try {
    const base64Font = await loadBase64File(fontFile, base64Type.FONT);
    fontFaces += `
        @font-face {
          font-family: '${fontFamily}';
          src: url(data:font/woff;base64,${base64Font}) format('woff');
          ${bold ? 'font-weight: 700;' : ''}
          ${italic ? 'font-style: italic;' : ''}
          ${cursive ? 'size-adjust: 187.5%;' : ''}
        }
    `;
  } catch (error) {
    console.error(`Error loading ${fontFamily} font from ${fontFile}`, error);
  }
}

async function loadIcon(iconFile) {
  try {
    const base64Icon = await loadBase64File(iconFile, base64Type.IMAGE);
    return `data:image/svg+xml;base64,${base64Icon}`;
  } catch (error) {
    console.error(`Error loading pic`, error);
    return null;
  }
}

async function initEditor() {
  const fontItems = [
    // OpenDyslexic
    { fontFamily: 'OpenDyslexic', fontFile: 'opendyslexic_regular.woff' },
    { bold: true, fontFamily: 'OpenDyslexic', fontFile: 'opendyslexic_bold.woff' },
    { bold: true, fontFamily: 'OpenDyslexic', fontFile: 'opendyslexic_bolditalic.woff', italic: true },
    { fontFamily: 'OpenDyslexic', fontFile: 'opendyslexic_italic.woff', italic: true },
    //Lora
    { fontFamily: 'Lora', fontFile: 'lora_regular.woff' },
    { bold: true, fontFamily: 'Lora', fontFile: 'lora_bold.woff' },
    { bold: true, fontFamily: 'Lora', fontFile: 'lora_bolditalic.woff', italic: true },
    { fontFamily: 'Lora', fontFile: 'lora_italic.woff', italic: true },
    //IBM Plex Mono
    { fontFamily: 'IBM Plex Mono', fontFile: 'ibmplexmono_regular.woff' },
    { bold: true, fontFamily: 'IBM Plex Mono', fontFile: 'ibmplexmono_bold.woff' },
    { bold: true, fontFamily: 'IBM Plex Mono', fontFile: 'ibmplexmono_bolditalic.woff', italic: true },
    { fontFamily: 'IBM Plex Mono', fontFile: 'ibmplexmono_italic.woff', italic: true },
    //Font
    { fontFamily: 'Font', fontFile: 'font_regular.woff' },
    { bold: true, fontFamily: 'Font', fontFile: 'font_bold.woff' },
    { bold: true, fontFamily: 'Font', fontFile: 'font_bolditalic.woff', italic: true },
    { fontFamily: 'Font', fontFile: 'font_italic.woff', italic: true },
    //Ecriture A
    { cursive: true, fontFamily: 'Ecriture A', fontFile: 'ecriturea_regular.woff' },
    { cursive: true, fontFamily: 'Ecriture A', fontFile: 'ecriturea_italic.woff', italic: true },
  ];
  await Promise.all(fontItems.map(loadFont));
  attachmentIcon = await loadIcon('attachment.svg');
  audioIcon = await loadIcon('audio.svg');
  playIcon = await loadIcon('play.svg');
  imagePlaceholder = await loadIcon('image-not-found.svg');
}

/**
 * Serialises the config for injection inside a <script> tag.
 * Escaping "<" prevents any string value (an SVG data-uri, a translated
 * placeholder...) from closing the tag early.
 */
function serializeConfig(config) {
  return JSON.stringify(config).replace(/</g, '\\u003c');
}

function createHTML(options = {}) {
  const {
    autoCapitalize = 'off',
    autoCorrect = false,
    defaultParagraphSeparator = 'div',
    enterKeyHint = '',
    firstFocusEnd = true,
    initialFocus = false,
    inputListener = false,
    keyDownListener = false,
    keyUpListener = false,
    pasteAsPlainText = false,
    // When first gaining focus, the cursor moves to the end of the text
    pasteListener = false,
    styleWithCSS = false,
    useComposition = true,
    // Enable/Disable composition
    useContainer = true,
  } = options;

  const placeholderColor = theme.palette.grey.graphite;

  const editorConfig = {
    autoCapitalize,
    autoCorrect,
    defaultParagraphSeparator,
    enterKeyHint,
    firstFocusEnd,
    image: { height: ui.image.height, width: ui.image.width },
    imagePlaceholder,
    imagePlaceholderBackgroundColor: theme.palette.grey.pearl,
    initialFocus,
    inputListener,
    insertElementTimeout: ui.insertElementTimeout,
    isDev: !!window.__DEV__,
    keyDownListener,
    keyUpListener,
    mediaWidth: UI_SIZES.screen.width - UI_SIZES.spacing.medium * 2,
    pasteAsPlainText,
    pasteListener,
    placeholderColor,
    platformUrl: pfUrl,
    styleWithCSS,
    updateHeightTimeout: ui.updateHeightTimeout,
    useComposition,
    useContainer,
    videoThumbnail: UI_SIZES.elements.videoThumbnail,
  };

  return `
<!DOCTYPE html>
<html>
<head>
    <title>RN Rich Text Editor</title>
    <meta name="viewport" content="user-scalable=1.0,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0">
    <style>
        ${fontFaces}
        * {outline: 0px solid transparent;-webkit-tap-highlight-color: rgba(0,0,0,0);-webkit-touch-callout: none;box-sizing: border-box;}
        html, body { margin: 0; padding: 0;font-family: Font; font-size:1em; height: 100%;}
        body { overflow-y: hidden; -webkit-overflow-scrolling: touch;background-color: ${theme.palette.grey.white};}
        .content {font-family: Font;color: ${theme.palette.grey.black}; width: 100%;${
          !useContainer ? 'height:100%;' : ''
        }-webkit-overflow-scrolling: touch;padding-left: 0;padding-right: 0;}
 .pell { height: 100%;} .pell-content { outline: 0; overflow-y: auto;padding: 0;height: 100%; font-size: 16px; line-height: 24px; overflow-x: hidden; max-width: 100%;}
        [placeholder]:empty:before { content: attr(placeholder); color: ${placeholderColor}; font-style: italic}
        [placeholder]:empty:focus:before { content: attr(placeholder);color: ${placeholderColor};display:block;}
        .x-todo li {list-style:none;}
        .x-todo-box {position: relative; left: -24px;}
        .x-todo-box input{position: absolute;}
        pre{padding: 10px 5px 10px 10px;margin: 15px 0;display: block;line-height: 18px;background: #F0F0F0;border-radius: 6px;font-size: 13px; font-family: 'monaco', 'Consolas', "Liberation Mono", Courier, monospace; word-break: break-all; word-wrap: break-word;overflow-x: auto;}
        pre code {display: block;font-size: inherit;white-space: pre-wrap;color: inherit;}

        h1 {font-size: ${TextSizeStyle.Huge.fontSize}px; line-height: ${TextSizeStyle.Huge.lineHeight}px;}
        h2 {font-size: ${TextSizeStyle.Bigger.fontSize}px; line-height: ${TextSizeStyle.Bigger.lineHeight}px;}
        h1, h2, a {color: ${theme.palette.primary.regular}}
        strong, b {font-weight: 700;}
        em {font-style: italic;}
        .download-attachments, .attachments {background-color: ${theme.palette.grey.fog}; padding: ${UI_SIZES.spacing.small}px; border-radius: ${UI_SIZES.radius.newCard}px; border: ${UI_SIZES.elements.border.thin}px solid ${theme.palette.grey.pearl};}
        .download-attachments h2, .download-attachments a, .attachments a {color: ${theme.palette.grey.black}; text-decoration: none;}
        .download-attachments h2 {margin: 0 0 ${UI_SIZES.spacing.small}px 0; font-size: ${getScaleFontSize(12)}px; line-height: ${getScaleFontSize(20)}px}
        .attachments {display: flex; flex-direction: column;}
        .attachments::before {content: '${I18n.get('attachment-attachments')}'; margin-bottom: ${UI_SIZES.spacing.small}px; font-size: ${getScaleFontSize(12)}px; font-weight: 700;}
        .attachments a { padding: ${UI_SIZES.spacing.minor}px ${UI_SIZES.spacing.small}px; border:  ${UI_SIZES.elements.border.thin}px solid ${theme.palette.grey.pearl}; border-radius: ${UI_SIZES.radius.mediumPlus}px; display: flex; align-items: center; align-items: center; margin-bottom: ${UI_SIZES.spacing.small}px; background-color: ${theme.palette.grey.white}; word-break: break-all; position: relative; padding-left: calc(${UI_SIZES.spacing.minor}px + ${UI_SIZES.spacing.small}px + ${UI_SIZES.elements.icon.medium}px);}
        .attachments a:last-child {margin-bottom: 0;}
        .attachments a::before {content: ""; position: absolute; left: ${UI_SIZES.spacing.small}px; background-image: url(${attachmentIcon}); background-size: cover; background-repeat: no-repeat; height: ${UI_SIZES.elements.icon.medium}px; width: ${UI_SIZES.elements.icon.medium}px; margin-right: ${UI_SIZES.spacing.minor}px;}
        .download-attachments .attachments {padding: 0; border: none;}
        .download-attachments .attachments::before {display: none;}
        .audio-wrapper {background-color: ${theme.palette.grey.fog}; padding: ${UI_SIZES.spacing.minor}px ${UI_SIZES.spacing.small}px; border-radius: ${UI_SIZES.spacing.big}px; display: flex; border: ${UI_SIZES.elements.border.thin}px solid ${theme.palette.grey.pearl}; align-items: center; margin: ${UI_SIZES.spacing.minor}px 0;}
        .audio-wrapper::before {content: ""; background-image: url(${audioIcon}); background-size: contain; background-repeat: no-repeat; height: ${getScaleWidth(36)}px; width: ${getScaleWidth(285)}px;}
        .audio-wrapper:active {opacity: 0.7;}
        .audio-wrapper audio {display: none;}
        table {min-width: 100%; max-width: 100%;}
        table, th, td {border: ${UI_SIZES.elements.border.default}px solid ${theme.palette.grey.grey}; border-collapse: collapse;}
        th, td {padding: ${UI_SIZES.spacing._LEGACY_tiny}px ${UI_SIZES.spacing.tiny}px;}
        th {text-align: left; background-color: ${theme.palette.grey.pearl};}
        iframe {border: none; max-width: 100%;}
        .iframe-wrapper {position: relative; overflow: hidden; width: 100%; padding-top: 56.25%;}
        .video-wrapper {position: relative}
        .video-wrapper::before {content: ""; background-image: url(${playIcon}); background-size: ${playIconSize}px ${playIconSize}px; height: ${playIconSize}px; width: ${playIconSize}px; position: absolute; top: 0; left: 0; z-index: 1; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;}
        video {border-radius: ${UI_SIZES.radius.small}px;}
        img {max-width: 100vw; max-height: 100vw; height: auto; width: auto; border-radius: ${UI_SIZES.radius.small}px; margin: ${UI_SIZES.spacing.tiny}px auto; display: flex;}
        ul, ol {list-style-position: outside; }
        li p {margin: 0; padding: 0;}
        .conversation-history > div {margin-left: 10px; padding-left: 10px; border-left: 1px ridge #C7C7C7;}
        #content>p:first-child { margin-block-start: 0;}
        #content>p:last-child { margin-block-end: 0;}
        mark[data-color="transparent"] { background-color: transparent; }
    </style>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.38/dist/katex.min.css" integrity="sha384-/L6i+LN3dyoaK2jYG5ZLh5u13cjdsPDcFOSNJeFBFa/KgVXR5kOfTdiN3ft1uMAq" crossorigin="anonymous">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.38/dist/katex.min.js" integrity="sha384-H6s1ZrH2CKpFpqR680poRdStIRJGXty7fSkxAcIfxwl9iu6A4BOPtTk7vQ58Ovio" crossorigin="anonymous"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.38/dist/contrib/auto-render.min.js" integrity="sha384-bjyGPfbij8/NDKJhSGZNP/khQVgtHUE5exjm4Ydllo42FwIgYsdLO2lXGmRBf5Mz" crossorigin="anonymous"></script>


</head>
<body>
<div class="content"><div id="editor" class="pell"/></div>
<script>window.__EDITOR_CFG__ = ${serializeConfig(editorConfig)};</script>
<script>
${editorScript}
</script>
</body>
</html>
`;
}

const HTML = createHTML();
export { createHTML, HTML, initEditor };
