import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES, getScaleFontSize, getScaleWidth } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';

let audioIcon = '';
let attachmentIcon = '';
let fontFaces = '';

const base64Type = {
  FONT: 'fonts',
  IMAGE: 'images',
};

const pfUrl = getSession()?.platform?.url || '';

async function loadBase64File(fileName, type) {
  let base64String = '';
  if (Platform.OS === 'android') base64String = await RNFS.readFileAssets(`${type}/${fileName}`, 'base64');
  else base64String = await RNFS.readFile(`${RNFS.MainBundlePath}/${fileName}`, 'base64');
  return base64String;
}

async function loadFont(fontInfo) {
  const { fontFile, fontFamily, bold, italic, cursive } = fontInfo;
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
    console.debug(`${fontFamily} font loaded from ${fontFile}`);
  } catch (error) {
    console.error(`Error loading ${fontFamily} font from ${fontFile}`, error);
  }
}

async function loadIcon(iconFile) {
  try {
    const base64Icon = await loadBase64File(iconFile, base64Type.IMAGE);
    console.debug(`Icon loaded from ${iconFile}`);
    return `data:image/svg+xml;base64,${base64Icon}`;
  } catch (error) {
    console.error(`Error loading pic`, error);
    return null;
  }
}

async function initEditor() {
  const fontItems = [
    // OpenDyslexic
    { fontFile: 'opendyslexic_regular.woff', fontFamily: 'OpenDyslexic' },
    { fontFile: 'opendyslexic_bold.woff', fontFamily: 'OpenDyslexic', bold: true },
    { fontFile: 'opendyslexic_bolditalic.woff', fontFamily: 'OpenDyslexic', bold: true, italic: true },
    { fontFile: 'opendyslexic_italic.woff', fontFamily: 'OpenDyslexic', italic: true },
    //Lora
    { fontFile: 'lora_regular.woff', fontFamily: 'Lora' },
    { fontFile: 'lora_bold.woff', fontFamily: 'Lora', bold: true },
    { fontFile: 'lora_bolditalic.woff', fontFamily: 'Lora', bold: true, italic: true },
    { fontFile: 'lora_italic.woff', fontFamily: 'Lora', italic: true },
    //IBM Plex Mono
    { fontFile: 'ibmplexmono_regular.woff', fontFamily: 'IBM Plex Mono' },
    { fontFile: 'ibmplexmono_bold.woff', fontFamily: 'IBM Plex Mono', bold: true },
    { fontFile: 'ibmplexmono_bolditalic.woff', fontFamily: 'IBM Plex Mono', bold: true, italic: true },
    { fontFile: 'ibmplexmono_italic.woff', fontFamily: 'IBM Plex Mono', italic: true },
    //Font
    { fontFile: 'font_regular.woff', fontFamily: 'Font' },
    { fontFile: 'font_bold.woff', fontFamily: 'Font', bold: true },
    { fontFile: 'font_bolditalic.woff', fontFamily: 'Font', bold: true, italic: true },
    { fontFile: 'font_italic.woff', fontFamily: 'Font', italic: true },
    //Ecriture A
    { fontFile: 'ecriturea_regular.woff', fontFamily: 'Ecriture A', cursive: true },
    { fontFile: 'ecriturea_italic.woff', fontFamily: 'Ecriture A', italic: true, cursive: true },
  ];
  await Promise.all(fontItems.map(loadFont));
  attachmentIcon = await loadIcon('attachment.svg');
  audioIcon = await loadIcon('audio.svg');
}

function createHTML(options = {}) {
  const {
    pasteAsPlainText = false,
    pasteListener = false,
    keyDownListener = false,
    keyUpListener = false,
    inputListener = false,
    autoCapitalize = 'off',
    enterKeyHint = '',
    initialFocus = false,
    autoCorrect = false,
    defaultParagraphSeparator = 'div',
    // When first gaining focus, the cursor moves to the end of the text
    firstFocusEnd = true,
    useContainer = true,
    styleWithCSS = false,
    // Enable/Disable composition
    useComposition = true,
  } = options;
  //ERROR: HTML height not 100%;

  const placeholderColor = theme.palette.grey.stone;

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
        .pell { height: 100%;} .pell-content { outline: 0; overflow-y: auto;padding: 0;height: 100%;$font-size: 16px; line-height: 24px; min-height: 200px; margin-top: 12px;}
        [placeholder]:empty:before { content: attr(placeholder); color: ${placeholderColor}; font-style: italic}
        [placeholder]:empty:focus:before { content: attr(placeholder);color: ${placeholderColor};display:block;}
        video {max-width: 98%;margin-left:auto;margin-right:auto;display: block;}
        img {max-width: 98%;vertical-align: middle;}
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
        .attachments::before {content: ${I18n.get('attachment-attachments')};margin-bottom: ${UI_SIZES.spacing.small}px; font-size: ${getScaleFontSize(12)}px; font-weight: 700;}
        .attachments a { padding: ${UI_SIZES.spacing.minor}px ${UI_SIZES.spacing.small}px; border:  ${UI_SIZES.elements.border.thin}px solid ${theme.palette.grey.pearl}; border-radius: ${UI_SIZES.radius.mediumPlus}px; display: flex; align-items: center; margin-bottom: ${UI_SIZES.spacing.small}px; background-color: ${theme.palette.grey.white};}
        .attachments a:last-child {margin-bottom: 0;}
        .attachments a::before {content: ""; background-image: url(${attachmentIcon}); background-size: ${UI_SIZES.elements.icon.medium}px ${UI_SIZES.elements.icon.medium}px; height: ${UI_SIZES.elements.icon.medium}px; width: ${UI_SIZES.elements.icon.medium}px; margin-right: ${UI_SIZES.spacing.minor}px;}
        .download-attachments .attachments {padding: 0; border: none;}
        .download-attachments .attachments::before {display: none;}
        .audio-wrapper {background-color: ${theme.palette.grey.fog}; padding: ${UI_SIZES.spacing.minor}px ${UI_SIZES.spacing.small}px; border-radius: ${UI_SIZES.spacing.big}px; display: flex; border: ${UI_SIZES.elements.border.thin}px solid ${theme.palette.grey.pearl}; align-items: center;}
        .audio-wrapper::before {content: ""; background-image: url(${audioIcon}); background-size: contain; background-repeat: no-repeat; height: ${getScaleWidth(36)}px; width: ${getScaleWidth(285)}px;}
        .audio-wrapper:active {opacity: 0.7;}
        .audio-wrapper audio {display: none;}
        table {min-width: 100%;}
        table, th, td {border: ${UI_SIZES.elements.border.default}px solid ${theme.palette.grey.grey}; border-collapse: collapse;}
        th, td {padding: ${UI_SIZES.spacing._LEGACY_tiny}px ${UI_SIZES.spacing.tiny}px;}
        th {text-align: left; background-color: ${theme.palette.grey.pearl};}
        iframe {border: none; max-width: 100%; height: auto;}
    </style>
</head>
<body>
<div class="content"><div id="editor" class="pell"/></div>
<script>
    var __DEV__ = !!${window.__DEV__};
    var _ = (function (exports) {
        var anchorNode, focusNode, anchorOffset, focusOffset, _focusCollapse = false, cNode;
        var _log = console.log;
        var placeholderColor = '${placeholderColor}';
        var _randomID = 99;
        var generateId = function (){
            return "auto_" + (++ _randomID);
        }

        var body = document.body, docEle = document.documentElement;
        var defaultParagraphSeparatorString = 'defaultParagraphSeparator';
        var formatBlock = 'formatBlock';
        var editor = null, editorFoucs = false, o_height = 0, compositionStatus = 0, paragraphStatus = 0, enterStatus = 0;
        function addEventListener(parent, type, listener) {
            return parent.addEventListener(type, listener);
        };
        function appendChild(parent, child) {
            return parent.appendChild(child);
        };
        function createElement(tag) {
            return document.createElement(tag);
        };
        function queryCommandEnabled(command) {
            return document.queryCommandEnabled(command);
        }
        function queryCommandState(command) {
            return document.queryCommandState(command);
        };
        function queryCommandValue(command) {
            return document.queryCommandValue(command);
        };
        function query(command){
            return document.querySelector(command);
        }
        function querys(command){
            return document.querySelectorAll(command);
        }

        function exec(command) {
            var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            return document.execCommand(command, false, value);
        };

        function asyncExec(command){
            var args = Array.prototype.slice.call(arguments);
            setTimeout(function(){
                exec.apply(null, args);
            }, 0);
        }

        function _postMessage(data){
            exports.window.postMessage(JSON.stringify(data));
        }
        function postAction(data, force = false){
            (editor.content.contentEditable === 'true' || force) && _postMessage(data);
        };

        exports.isRN && (
            console.log = function (){
                var data = Array.prototype.slice.call(arguments);
                __DEV__ && _log.apply(null, data);
                __DEV__ && postAction({type: 'LOG', data});
            }
        )

        function formatParagraph(async){
            (async ? asyncExec: exec)(formatBlock, '<' + editor.paragraphSeparator + '>' );
        }

        function getNodeByClass(node, className){
            return node ? (node.nodeType === Node.ELEMENT_NODE && node.classList.contains(className)? node : getNodeByClass(node.parentNode, className)): node;
        }

        function getNodeByName(node, name){
            return node? (node.nodeType === Node.ELEMENT_NODE && node.nodeName === name? node: getNodeByName(node.parentNode, name)): node;
        }

        function setCollapse(node){
            var selection = window.getSelection();
            selection.selectAllChildren(node);
            selection.collapseToEnd();
        }

        function checkboxNode(node){
            return getNodeByClass(node, 'x-todo');
        }

        function execCheckboxList (node, html){
            var html = createCheckbox(node ? node.innerHTML: '');
            var HTML = "<ol class='x-todo'><li>"+ html +"</li></ol>"
            var foNode;
            if (node){
                node.innerHTML = HTML;
                foNode = node.firstChild;
            } else {
                exec("insertHTML", HTML);
            }

            foNode && setTimeout(function (){
                setCollapse(foNode);
            });
        }

        var _checkboxFlag = 0; // 1 = add checkbox; 2 = cancel checkbox
        function cancelCheckboxList(box){
            _checkboxFlag = 2;
            exec("insertOrderedList");
            setCollapse(box);
        }

        function createCheckbox(end){
            var html = '<span contenteditable="false" class="x-todo-box"><input type="checkbox"></span>';
            if (end && typeof end !== 'boolean'){
                html += end;
            } else if(end !== false){
                html += "<br/>"
            }
            return html;
        }

        function insertCheckbox (node){
            var li = getNodeByName(node, 'LI');
            li.insertBefore(document.createRange().createContextualFragment(createCheckbox(false)), li.firstChild);
            setCollapse(node);
        }

        function getCheckbox (node){
            return getNodeByClass(node, "x-todo-box");
        }

        function saveSelection(){
            var sel = window.getSelection();
            currentSelection = sel;
            anchorNode = sel.anchorNode;
            anchorOffset = sel.anchorOffset;
            focusNode = sel.focusNode;
            focusOffset = sel.focusOffset;
        }

        function focusCurrent(){
            editor.content.focus();
            try {
                var selection = window.getSelection();
                if (anchorNode){
                    if (anchorNode !== selection.anchorNode && !selection.containsNode(anchorNode)){
                        _focusCollapse = true;
                        selection.collapse(anchorNode, anchorOffset);
                    }
                } else if(${firstFocusEnd} && !_focusCollapse ){
                    _focusCollapse = true;
                    selection.selectAllChildren(editor.content);
                    selection.collapseToEnd();
                }
            } catch(e){
                console.log(e)
            }
        }

        var _keyDown = false;
        function handleChange (event){
            var node = anchorNode;
            Actions.UPDATE_HEIGHT();
            Actions.UPDATE_OFFSET_Y();
            if (_keyDown){
                if(_checkboxFlag === 1 && checkboxNode(node)){
                    _checkboxFlag = 0;
                    var sib = node.previousSibling;
                    if (!sib || sib.childNodes.length > 1){
                        insertCheckbox(node);
                    }
                } else if(_checkboxFlag === 2){
                    _checkboxFlag = 0;
                    var sp = createElement(editor.paragraphSeparator);
                    var br = createElement('br');
                    sp.appendChild(br);
                    setTimeout(function (){
                        if (!node.classList.contains("x-todo-box")){
                            node = node.parentNode.previousSibling;
                        }
                        node.parentNode.replaceChild(sp, node);
                        setCollapse(sp);
                    });
                }
            }
        }

        function adjustNestedElements() {
            // adjust ul/ol if we use p separator
            // since nesting is not valid for p
            if (editor.paragraphSeparator == 'p') {
                var selection = window.getSelection();

                let lists = document.querySelectorAll("ol, ul");
                for (let i = 0; i < lists.length; i++) {
                    let ele = lists[i];
                    let parentNode = ele.parentNode;
                    if (parentNode.tagName === 'P' && parentNode.lastChild === parentNode.firstChild) {
                        parentNode.insertAdjacentElement('beforebegin', ele);
                        parentNode.remove()
                    }
                }

                selection.collapse(anchorNode, anchorOffset);
            }
        }

        var Actions = {
            bold: { state: function() { return queryCommandState('bold'); }, result: function() { return exec('bold'); }},
            italic: { state: function() { return queryCommandState('italic'); }, result: function() { return exec('italic'); }},
            underline: { state: function() { return queryCommandState('underline'); }, result: function() { return exec('underline'); }},
            strikeThrough: { state: function() { return queryCommandState('strikeThrough'); }, result: function() { return exec('strikeThrough'); }},
            subscript: { state: function() { return queryCommandState('subscript'); }, result: function() { return exec('subscript'); }},
            superscript: { state: function() { return queryCommandState('superscript'); }, result: function() { return exec('superscript'); }},
            heading1: { state: function() { return queryCommandValue(formatBlock) === 'h1'; }, result: function() { return exec(formatBlock, '<h1>'); }},
            heading2: { state: function() { return queryCommandValue(formatBlock) === 'h2'; }, result: function() { return exec(formatBlock, '<h2>'); }},
            heading3: { state: function() { return queryCommandValue(formatBlock) === 'h3'; }, result: function() { return exec(formatBlock, '<h3>'); }},
            heading4: { state: function() { return queryCommandValue(formatBlock) === 'h4'; }, result: function() { return exec(formatBlock, '<h4>'); }},
            heading5: { state: function() { return queryCommandValue(formatBlock) === 'h5'; }, result: function() { return exec(formatBlock, '<h5>'); }},
            heading6: { state: function() { return queryCommandValue(formatBlock) === 'h6'; }, result: function() { return exec(formatBlock, '<h6>'); }},
            paragraph: { state: function() { return queryCommandValue(formatBlock) === 'p'; }, result: function() { return exec(formatBlock, '<p>'); }},
            quote: { result: function() { return exec(formatBlock, '<blockquote>'); }},
            removeFormat: { result: function() { return exec('removeFormat'); }},
            orderedList: {
                state: function() { return !checkboxNode(window.getSelection().anchorNode) && queryCommandState('insertOrderedList'); },
                result: function() {
                    if (!!checkboxNode(window.getSelection().anchorNode)) return;

                    let flag = exec('insertOrderedList');
                    adjustNestedElements();
                    return flag;
                }
            },
            unorderedList: {
                state: function() { return queryCommandState('insertUnorderedList');},
                result: function() {
                    if (!!checkboxNode(window.getSelection().anchorNode)) return;

                    let flag =  exec('insertUnorderedList');
                    adjustNestedElements();
                    return flag;
                }
            },
            code: { result: function(type) {
                var flag = exec(formatBlock, '<pre>');
                var node = anchorNode.nodeName === "PRE" ? anchorNode: anchorNode.parentNode;
                if (node.nodeName === 'PRE'){
                    type && node.setAttribute("type", type);
                    node.innerHTML = "<code type='"+(type || '') +"'>" + node.innerHTML + "</code>";
                    // var br = createElement("br");
                    // node.parentNode.insertBefore(br, node.nextSibling);
                    setTimeout(function (){
                        setCollapse(node.firstChild);
                    });
                }
                return flag;
             }},
            line: { result: function() { return exec('insertHorizontalRule'); }},
            redo: { state: function() { return queryCommandEnabled('redo'); }, result: function() { return exec('redo'); }},
            undo: { state: function() { return queryCommandEnabled('undo'); }, result: function() { return exec('undo'); }},
            indent: { result: function() { return exec('indent'); }},
            outdent: { result: function() { return exec('outdent'); }},
            outdent: { result: function() { return exec('outdent'); }},
            justifyCenter: {  state: function() { return queryCommandState('justifyCenter'); }, result: function() { return exec('justifyCenter'); }},
            justifyLeft: { state: function() { return queryCommandState('justifyLeft'); }, result: function() { return exec('justifyLeft'); }},
            justifyRight: { state: function() { return queryCommandState('justifyRight'); }, result: function() { return exec('justifyRight'); }},
            justifyFull: { state: function() { return queryCommandState('justifyFull'); }, result: function() { return exec('justifyFull'); }},
            hiliteColor: {  state: function() { return queryCommandValue('backColor'); }, result: function(color) { return exec('backColor', color); }},
            foreColor: { state: function() { return queryCommandValue('foreColor'); }, result: function(color) { return exec('foreColor', color); }},
            fontSize: { state: function() { return queryCommandValue('fontSize'); }, result: function(size) { return exec('fontSize', size); }},
            fontName: { result: function(name) { return exec('fontName', name); }},
            link: {
                result: function(data) {
                    // TODO: LEA - https://edifice-community.atlassian.net/browse/MB-2404
                    var sel = document.getSelection();
                    data = data || {};
                    var url = data.url || window.prompt('Enter the link URL');

                    if (url) {
                        var el = document.createElement("a");
                        el.setAttribute("href", url);

                        var title = data.title || sel.toString() || url;
                        el.text = title;

                        // when adding a link, if our current node is empty, it may have a <br>
                        // if so, replace it with '' so the added link doesn't end up with an extra space.
                        // Also, if totally empty, we must format the paragraph to add the link into the container.
                        var mustFormat = false;
                        if (sel.anchorNode && sel.anchorNode.innerHTML === '<br>') {
                            sel.anchorNode.innerHTML = '';
                        } else if (!sel.anchorNode || sel.anchorNode === editor.content) {
                            mustFormat = true;
                        }

                        // insert like this so we can replace current selection, if any
                        var range = sel.getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(el);

                        // restore cursor to end
                        range.setStartAfter(el);
                        range.setEndAfter(el);
                        sel.removeAllRanges();
                        sel.addRange(range);

                        // format paragraph if needed
                        if (mustFormat){
                            formatParagraph();
                        }

                        // save selection, and fire on change to our webview
                        saveSelection();
                        editor.settings.onChange();
                    }
                }
            },
            html: {
                result: function (html){
                    if (html){
                        exec('insertHTML', html);
                        Actions.UPDATE_HEIGHT();
                    }
                }
            },
            text: { result: function (text){ text && exec('insertText', text); }},
            audio: {
                result: function(url, style) {
                    if (url) {
                        // TODO: LEA - https://edifice-community.atlassian.net/browse/MB-2363
                        var thumbnail = url.replace(/.(mp4|m3u8)/g, '') + '-thumbnail';
                        var html = "<br><div style='"+ (style || '')+"'><audio src='"+ url +"' poster='"+ thumbnail + "' controls><source src='"+ url +"' type='video/mp4'>No video tag support</video></div><br>";
                        exec('insertHTML', html);
                        Actions.UPDATE_HEIGHT();
                        Actions.FORMAT_AUDIOS();
                    }
                }
            },
            image: {
                result: function(url, style) {
                    if (url){
                        // TODO: LEA - https://edifice-community.atlassian.net/browse/MB-2357
                        exec('insertHTML', "<img style='"+ (style || '')+"' src='"+ url +"'/>");
                        Actions.UPDATE_HEIGHT();
                        Actions.GET_IMAGE_URLS();
                    }
                }
            },
            video: {
                result: function(url, style) {
                    if (url) {
                        // TODO: LEA - https://edifice-community.atlassian.net/browse/MB-2360
                        var thumbnail = url.replace(/.(mp4|m3u8)/g, '') + '-thumbnail';
                        var html = "<br><div style='"+ (style || '')+"'><video src='"+ url +"' poster='"+ thumbnail + "' controls><source src='"+ url +"' type='video/mp4'>No video tag support</video></div><br>";
                        exec('insertHTML', html);
                        Actions.UPDATE_HEIGHT();
                        Actions.FORMAT_VIDEOS();
                    }
                }
            },
            checkboxList: {
                state: function(){return checkboxNode(window.getSelection().anchorNode)},
                result: function() {
                    if (queryCommandState('insertOrderedList')) return;
                    var pNode;
                    if (anchorNode){
                        pNode = anchorNode.parentNode;
                        if (anchorNode === editor.content) pNode = null;
                    }

                    if (anchorNode === editor.content || queryCommandValue(formatBlock) === ''){
                        formatParagraph();
                    }
                    var box = checkboxNode(anchorNode);
                    if (!!box){
                        cancelCheckboxList(box.parentNode);
                    } else {
                        !queryCommandState('insertOrderedList') && execCheckboxList(pNode);
                    }
                }
            },
            content: {
                setDisable: function(dis){ this.blur(); editor.content.contentEditable = !dis},
                setHtml: function(html) { editor.content.innerHTML = html; Actions.UPDATE_HEIGHT(); },
                getHtml: function() { return editor.content.innerHTML; },
                blur: function() { editor.content.blur(); },
                focus: function() { focusCurrent(); },
                postHtml: function (){ postAction({type: 'CONTENT_HTML_RESPONSE', data: editor.content.innerHTML}); },
                setPlaceholder: function(placeholder){ editor.content.setAttribute("placeholder", placeholder) },
                setContentStyle: function(styles) {
                    styles = styles || {};
                    var bgColor = styles.backgroundColor, color = styles.color, pColor = styles.placeholderColor;
                    if (bgColor && bgColor !== body.style.backgroundColor) body.style.backgroundColor = bgColor;
                    if (color && color !== editor.content.style.color) editor.content.style.color = color;
                    if (pColor && pColor !== placeholderColor){
                        var rule1="[placeholder]:empty:before {content:attr(placeholder);color:"+pColor+";}";
                        var rule2="[placeholder]:empty:focus:before{content:attr(placeholder);color:"+pColor+";}";
                        try {
                            document.styleSheets[1].deleteRule(0);document.styleSheets[1].deleteRule(0);
                            document.styleSheets[1].insertRule(rule1); document.styleSheets[1].insertRule(rule2);
                            placeholderColor = pColor;
                        } catch (e){
                            console.log("set placeholderColor error!")
                        }
                    }
                },
                commandDOM: function (command){
                    try {new Function("$", command)(exports.document.querySelector.bind(exports.document))} catch(e){console.log(e.message)};
                },
                command: function (command){
                    try {new Function("$", command)(exports.document)} catch(e){console.log(e.message)};
                },
                init: function() {
                    Actions.FORMAT_AUDIOS();
                    Actions.FORMAT_VIDEOS();
                    Actions.GET_IMAGE_URLS();
                    Actions.UPDATE_HEIGHT();
                }
            },

            init: function (){
                if (${useContainer}){
                    // setInterval(Actions.UPDATE_HEIGHT, 150);
                    Actions.UPDATE_HEIGHT();
                } else {
                    // react-native-webview There is a bug in the body and html height setting of a certain version of 100%
                    // body.style.height = docEle.clientHeight + 'px';
                }
            },

            UPDATE_HEIGHT: function() {
                if (!${useContainer}) return;
                // var height = Math.max(docEle.scrollHeight, body.scrollHeight);
                var height = editor.content.scrollHeight;
                if (o_height !== height){
                    _postMessage({type: 'OFFSET_HEIGHT', data: o_height = height});
                }
            },

            UPDATE_OFFSET_Y: function (){
                if (!${useContainer}) return;
                var node = anchorNode || window.getSelection().anchorNode;
                var sel = window.getSelection();
                if (node){
                    var siblingOffset = (node.nextSibling && node.nextSibling.offsetTop) || (node.previousSibling && node.previousSibling.offsetTop)
                    var rectOffset = null;
                    if (sel.rangeCount > 0) {
                        var range = sel.getRangeAt(0);
                        var rect = range.getClientRects()[0];
                        rectOffset = rect ? rect.y : null;
                    }

                    var offsetY = node.offsetTop || siblingOffset || rectOffset || node.parentNode.offsetTop;
                    if (offsetY){
                        _postMessage({type: 'OFFSET_Y', data: offsetY});
                    }
                }
            },

            FORMAT_AUDIOS: function() {
                var audios = document.getElementsByTagName('audios');
                for (var i = 0; i < audios.length; i++) {
                    const audio = audio[i];
                    video.autoplay = false;
                    video.controls = false;
                }
            },

            FORMAT_VIDEOS: function() {
                var videos = document.getElementsByTagName('video');
                for (var i = 0; i < videos.length; i++) {
                    const video = videos[i];
                    const videoSrc = video.getAttribute('src');
                    const videoRes = video.getAttribute('data-video-resolution');
                    video.autoplay = false;
                    video.controls = false;
                    video.poster = '${pfUrl}'+videoSrc+'?thumbnail='+videoRes;
                    // TODO: LEA - Calculate video width/height depending on design values
                    // videoRes contains string like '640x320'
                    video.style.height = '300px';
                    video.style.width = '100%';
                }
            },

            GET_IMAGE_URLS: function() {
                var images = document.getElementsByTagName('img');
                var imageUrls = [];
                for (var i = 0; i < images.length; i++) {
                    imageUrls.push(images[i].src);
                }
                postAction({type: 'IMAGE_URLS', data: imageUrls}, true);
            }
        };

        var init = function init(settings) {

            var paragraphSeparator = settings[defaultParagraphSeparatorString];
            var content = settings.element.content = createElement('div');
            content.id = 'content';
            content.contentEditable = true;
            content.spellcheck = false;
            content.autofocus = ${initialFocus};
            content.enterKeyHint = '${enterKeyHint}';
            content.autocapitalize = '${autoCapitalize}';
            content.autocorrect = ${autoCorrect};
            content.autocomplete = 'off';
            content.className = "pell-content";
            content.oninput = function (_ref) {
                // var firstChild = _ref.target.firstChild;
                if ((anchorNode === void 0 || anchorNode === content) && queryCommandValue(formatBlock) === ''){
                    if ( !compositionStatus ){
                        formatParagraph(true);
                        paragraphStatus = 0;
                    } else {
                        paragraphStatus = 1;
                    }
                } else if (content.innerHTML === '<br>'){
                    content.innerHTML = '';
                } else if (enterStatus && queryCommandValue(formatBlock) === 'blockquote') {
                    formatParagraph();
                }

                saveSelection();
                handleChange(_ref);
                settings.onChange();
                ${inputListener} && postAction({type: "ON_INPUT", data: {inputType: _ref.inputType, data: _ref.data}});
            };
            appendChild(settings.element, content);

            if (settings.styleWithCSS) exec('styleWithCSS');
            exec(defaultParagraphSeparatorString, paragraphSeparator);

            var actionsHandler = [];
            for (var k in Actions){
                if (typeof Actions[k] === 'object' && Actions[k].state){
                    actionsHandler[k] = Actions[k]
                }
            }

            function handler() {
                var activeTools = [];
                for(var k in actionsHandler){
                    const state =  Actions[k].state();
                    if ( state ){
                        activeTools.push(typeof state === "boolean" ? k : {type: k, value: Actions[k].state()});
                    }
                }
                postAction({type: 'SELECTION_CHANGE', data: activeTools});
            };

            var _handleStateDT = null;
            function handleState(){
                clearTimeout(_handleStateDT);
                _handleStateDT = setTimeout(function (){
                    handler();
                    saveSelection();
                }, 50);
            }

            function handleSelecting(event){
                event.stopPropagation();
                handleState();
            }

            function postKeyAction(event, type){
                postAction({type: type, data: {keyCode: event.keyCode, key: event.key}});
            }
            function handleKeyup(event){
                enterStatus = 0;
                _keyDown = false;
                if (event.keyCode === 8) handleSelecting (event);
                ${keyUpListener} && postKeyAction(event, "CONTENT_KEYUP")
            }
            function handleKeydown(event){
                _keyDown = true;
                 handleState();
                if (event.key === 'Enter'){
                    enterStatus = 1; // set enter true
                    var box;
                    var block = queryCommandValue(formatBlock);
                    if (anchorNode.innerHTML === '<br>' && anchorNode.parentNode !== editor.content){
                        // setCollapse(editor.content);
                    } else if (queryCommandState('insertOrderedList') && !!(box = checkboxNode(anchorNode))){
                        var node = anchorNode && anchorNode.childNodes[1];
                        if (node && node.nodeName === 'BR'){
                            cancelCheckboxList(box.parentNode);
                            event.preventDefault();
                        } else{
                            // add checkbox
                            _checkboxFlag = 1;
                        }
                    }
                    if (block === 'pre' && anchorNode.innerHTML === '<br>'){
                        // code end enter new line (Unfinished)
                        if (!anchorNode.nextSibling){
                            event.preventDefault();
                            var node = anchorNode.parentNode;
                            var br = createElement("br");
                            node.parentNode.insertBefore(br, node.nextSibling);
                            setTimeout(function (){
                                setCollapse(br);
                            });
                        }
                    }
                }
                ${keyDownListener} && postKeyAction(event, "CONTENT_KEYDOWN");
            }
            function handleFocus (){
                editorFoucs = true;
                setTimeout(function (){
                    Actions.UPDATE_OFFSET_Y();
                });
                postAction({type: 'CONTENT_FOCUSED'});
            }
            function handleBlur (){
                editorFoucs = false;
                postAction({type: 'SELECTION_CHANGE', data: []});
                postAction({type: 'CONTENT_BLUR'});
            }
            function handleClick(event){
                var ele = event.target;
                if (ele.nodeName === 'INPUT' && ele.type === 'checkbox'){
                    // Set whether the checkbox is selected by default
                    if (ele.checked) ele.setAttribute('checked', '');
                    else ele.removeAttribute('checked');
                }
                if (ele.nodeName === 'A' && ele.getAttribute('href')) {
                    postAction({type: 'LINK_TOUCHED', data: ele.getAttribute('href')}, true);
                }
                if (ele.getAttribute('class') === 'audio-wrapper') {
                    var audioSrc = ele.querySelector('audio').getAttribute('src');
                    postAction({type: 'AUDIO_TOUCHED', data: audioSrc}, true);
                }
                if (ele.nodeName === 'IMG' && ele.getAttribute('src')) {
                    postAction({type: 'IMAGE_TOUCHED', data: ele.getAttribute('src')}, true);
                }
                if (ele.nodeName === 'VIDEO' && ele.getAttribute('src')) {
                    postAction({type: 'VIDEO_TOUCHED', data: ele.getAttribute('src')}, true);
                }
            }
            addEventListener(content, 'touchcancel', handleSelecting);
            addEventListener(content, 'mouseup', handleSelecting);
            addEventListener(content, 'touchend', handleSelecting);
            addEventListener(content, 'keyup', handleKeyup);
            addEventListener(content, 'click', handleClick);
            addEventListener(content, 'keydown', handleKeydown);
            addEventListener(content, 'blur', handleBlur);
            addEventListener(content, 'focus', handleFocus);
            addEventListener(content, 'paste', function (e) {
                // get text representation of clipboard
                var text = (e.originalEvent || e).clipboardData.getData('text/plain');

                ${pasteListener} && postAction({type: 'CONTENT_PASTED', data: text});
                if (${pasteAsPlainText}) {
                    // cancel paste
                    e.preventDefault();
                    // insert text manually
                    exec("insertText", text);
                }
            });
            addEventListener(content, 'compositionstart', function(event){
                if(${useComposition}){
                    compositionStatus = 1;
                }
            })
            addEventListener(content, 'compositionend', function (event){
                if(${useComposition}){
                    compositionStatus = 0;
                    paragraphStatus && formatParagraph(true);
                }
            })

            var message = function (event){
                var msgData = JSON.parse(event.data), action = Actions[msgData.type];
                if (action ){
                    if ( action[msgData.name]){
                        var flag = msgData.name === 'result';
                        // insert image or link need current focus
                        flag && focusCurrent();
                        action[msgData.name](msgData.data, msgData.options);
                        flag && handleState();
                    } else {
                        action(msgData.data, msgData.options);
                    }
                }
            };
            document.addEventListener("message", message , false);
            window.addEventListener("message", message , false);
            document.addEventListener('mouseup', function (event) {
                event.preventDefault();
                Actions.content.focus();
                handleSelecting(event);
            });
            return {content, paragraphSeparator: paragraphSeparator, settings};
        };

        var _handleCTime = null;
        editor = init({
            element: document.getElementById('editor'),
            defaultParagraphSeparator: '${defaultParagraphSeparator}',
            styleWithCSS: ${styleWithCSS},
            onChange: function (){
                clearTimeout(_handleCTime);
                _handleCTime = setTimeout(function(){
                    var html = Actions.content.getHtml();
                    postAction({type: 'CONTENT_CHANGE', data: html});
                }, 50);
            }
        })
        return {
            sendEvent: function (type, data){
                event.preventDefault();
                event.stopPropagation();
                var id = event.currentTarget.id;
                if ( !id ) event.currentTarget.id = id = generateId();
                _postMessage({type, id, data});
            }
        }
    })({
        window: window.ReactNativeWebView || window.parent,
        isRN: !!window.ReactNativeWebView ,
        document: document
    });
</script>
</body>
</html>
`;
}

const HTML = createHTML();
export { HTML, createHTML, initEditor };
