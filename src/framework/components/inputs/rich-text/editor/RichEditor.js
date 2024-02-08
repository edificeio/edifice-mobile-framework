import React, { Component } from 'react';
import { Keyboard, Platform, StyleSheet, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';

import theme from '~/app/theme';
import { LoadingIndicator } from '~/framework/components/loading';
import { getSession } from '~/framework/modules/auth/reducer';
import { OAuth2RessourceOwnerPasswordClient } from '~/infra/oauth.ts';

import { actions, messages } from './const';
import { createHTML } from './editor';

const PlatformIOS = Platform.OS === 'ios';

const styles = StyleSheet.create({
  _input: {
    position: 'absolute',
    width: 1,
    height: 1,
    zIndex: -999,
    bottom: -999,
    left: -999,
  },
  webview: {
    backgroundColor: theme.palette.grey.white,
  },
});

export default class RichEditor extends Component {
  static defaultProps = {
    contentInset: {},
    style: {},
    placeholder: '',
    initialContentHTML: '',
    initialFocus: false,
    disabled: false,
    useContainer: true,
    pasteAsPlainText: false,
    autoCapitalize: 'off',
    defaultParagraphSeparator: 'div',
    editorInitializedCallback: () => {},
    initialHeight: 0,
  };

  constructor(props) {
    super(props);
    const that = this;
    that.renderWebView = that.renderWebView.bind(that);
    that.onMessage = that.onMessage.bind(that);
    that.sendAction = that.sendAction.bind(that);
    that.registerToolbar = that.registerToolbar.bind(that);
    that._onKeyboardWillShow = that._onKeyboardWillShow.bind(that);
    that._onKeyboardWillHide = that._onKeyboardWillHide.bind(that);
    that.init = that.init.bind(that);
    that.onViewLayout = that.onViewLayout.bind(that);
    that.setRef = that.setRef.bind(that);
    that.unmount = false;
    that._keyOpen = false;
    that._focus = false;
    that.layout = {};
    that.selectionChangeListeners = [];
    that.pfUrl = getSession()?.platform?.url || '';
    that.htmlLoaded = false;
    that.imageUrls = [];
    that._onAudioTouched = that._onAudioTouched.bind(that);
    that._onImageTouched = that._onImageTouched.bind(that);
    that._onLinkTouched = that._onLinkTouched.bind(that);
    that._onVideoTouched = that._onVideoTouched.bind(that);
    const {
      html,
      pasteAsPlainText,
      onPaste,
      onKeyUp,
      onKeyDown,
      onInput,
      enterKeyHint,
      autoCapitalize,
      autoCorrect,
      defaultParagraphSeparator,
      firstFocusEnd,
      useContainer,
      initialHeight,
      initialFocus,
      disabled,
      styleWithCSS,
      useComposition,
    } = props;
    that.state = {
      html: {
        html:
          html ||
          createHTML({
            pasteAsPlainText,
            pasteListener: !!onPaste,
            keyUpListener: !!onKeyUp,
            keyDownListener: !!onKeyDown,
            inputListener: !!onInput,
            enterKeyHint,
            autoCapitalize,
            autoCorrect,
            initialFocus: initialFocus && !disabled,
            defaultParagraphSeparator,
            firstFocusEnd,
            useContainer,
            styleWithCSS,
            useComposition,
          }),
        baseUrl: that.pfUrl,
      },
      height: initialHeight,
      keyboardHeight: 0,
      loading: true,
      oneSessionId: '',
    };
    that.focusListeners = [];
    // Retrieve oneSessionId to view ENT resources properly
    OAuth2RessourceOwnerPasswordClient?.connection
      ?.getOneSessionId()
      .then(osi => {
        console.debug(`oneSessionId retrieved: ${osi}`);
        this.setState({ oneSessionId: osi ?? '' });
      })
      .catch(err => console.warn(`Unable to retrieve oneSessionId: ${err.message}`))
      .finally(() => this.setState({ loading: false }));
    // IFrame video auto play bug fix
    setTimeout(() => {
      that.htmlLoaded = true;
      this.sendAction(actions.content, 'init');
    }, 1000);
  }

  componentDidMount() {
    this.unmount = false;
    if (PlatformIOS) {
      this.keyboardEventListeners = [
        Keyboard.addListener('keyboardWillShow', this._onKeyboardWillShow),
        Keyboard.addListener('keyboardWillHide', this._onKeyboardWillHide),
      ];
    } else {
      this.keyboardEventListeners = [
        Keyboard.addListener('keyboardDidShow', this._onKeyboardWillShow),
        Keyboard.addListener('keyboardDidHide', this._onKeyboardWillHide),
      ];
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { editorStyle, disabled, placeholder } = this.props;
    if (prevProps.editorStyle !== editorStyle) {
      editorStyle && this.setContentStyle(editorStyle);
    }
    if (disabled !== prevProps.disabled) {
      this.setDisable(disabled);
    }
    if (placeholder !== prevProps.placeholder) {
      this.setPlaceholder(placeholder);
    }
  }

  componentWillUnmount() {
    this.unmount = true;
    this.keyboardEventListeners.forEach(eventListener => eventListener.remove());
  }

  _getAbsoluteUrl(url) {
    return url.startsWith('/') ? this.pfUrl + url : url;
  }

  _onKeyboardWillShow(event) {
    this._keyOpen = true;
  }

  _onKeyboardWillHide(event) {
    this._keyOpen = false;
  }

  _onAudioTouched(url) {
    alert('AUDIO TOUCHED: ' + url);
    // TODO: LEA - https://edifice-community.atlassian.net/browse/MB-2435
  }

  _onImageTouched(url, imageUrls) {
    alert('IMAGE TOUCHED: ' + url);
    console.debug('IMAGE URLS:', imageUrls); // imageUrls contains all images urls
    // TODO: LEA - https://edifice-community.atlassian.net/browse/MB-2436
  }

  _onLinkTouched(url) {
    alert('LINK TOUCHED: ' + url);
    // TODO: LEA
    // V1: Redirection vers le responsive (Lien relatif => ajouter pfUrl)
    // V2: https://edifice-community.atlassian.net/browse/MB-2437
  }

  _onVideoTouched(url) {
    alert('VIDEO TOUCHED: ' + url);
    // TODO: LEA - https://edifice-community.atlassian.net/browse/MB-2435
  }

  onMessage(event) {
    const that = this;
    const { onFocus, onBlur, onChange, onPaste, onKeyUp, onKeyDown, onInput, onMessage, onCursorPosition, onLink } = that.props;
    try {
      const message = JSON.parse(event.nativeEvent.data);
      const data = message.data;
      switch (message.type) {
        case messages.CONTENT_HTML_RESPONSE:
          if (that.contentResolve) {
            that.contentResolve(message.data);
            that.contentResolve = undefined;
            that.contentReject = undefined;
            if (that.pendingContentHtml) {
              clearTimeout(that.pendingContentHtml);
              that.pendingContentHtml = undefined;
            }
          }
          break;
        case messages.LINK_TOUCHED:
          that._onLinkTouched(that._getAbsoluteUrl(data));
          break;
        case messages.LOG:
          console.log('FROM EDIT:', ...data);
          break;
        case messages.SELECTION_CHANGE:
          const items = message.data;
          that.selectionChangeListeners.map(listener => {
            listener(items);
          });
          break;
        case messages.CONTENT_FOCUSED:
          that._focus = true;
          that.focusListeners.map(da => da()); // Subsequent versions will be deleted
          onFocus?.();
          break;
        case messages.CONTENT_BLUR:
          that._focus = false;
          onBlur?.();
          break;
        case messages.CONTENT_CHANGE:
          onChange?.(data);
          break;
        case messages.CONTENT_PASTED:
          onPaste?.(data);
          break;
        case messages.CONTENT_KEYUP:
          onKeyUp?.(data);
          break;
        case messages.CONTENT_KEYDOWN:
          onKeyDown?.(data);
          break;
        case messages.ON_INPUT:
          onInput?.(data);
          break;
        case messages.OFFSET_HEIGHT:
          that.setWebHeight(data);
          break;
        case messages.OFFSET_Y:
          const offsetY = Number.parseInt(Number.parseInt(data) + that.layout.y || 0);
          offsetY > 0 && onCursorPosition(offsetY);
          break;
        case messages.AUDIO_TOUCHED:
          that._onAudioTouched(that._getAbsoluteUrl(data));
          break;
        case messages.IMAGE_TOUCHED:
          that._onImageTouched(that._getAbsoluteUrl(data), that.imageUrls);
          break;
        case messages.IMAGE_URLS:
          that.imageUrls = data.map(url => that._getAbsoluteUrl(url));
          break;
        case messages.VIDEO_TOUCHED:
          that._onVideoTouched(that._getAbsoluteUrl(data));
          break;
        default:
          onMessage?.(message);
          break;
      }
    } catch (e) {
      //alert('NON JSON MESSAGE');
    }
  }

  setWebHeight(height) {
    const { onHeightChange, useContainer, initialHeight } = this.props;
    if (height !== this.state.height) {
      const maxHeight = Math.max(height, initialHeight);
      if (!this.unmount && useContainer && maxHeight >= initialHeight) {
        this.setState({ height: maxHeight });
      }
      onHeightChange && onHeightChange(height);
    }
  }

  sendAction(type, action, data, options) {
    const jsonString = JSON.stringify({ type, name: action, data, options });
    if (!this.unmount && this.webviewBridge) {
      this.webviewBridge.postMessage(jsonString);
    }
  }

  setRef(ref) {
    this.webviewBridge = ref;
  }

  renderWebView() {
    const that = this;
    const { html, editorStyle, useContainer, style, onLink, ...rest } = that.props;
    const { html: viewHTML, oneSessionId } = that.state;
    const js = `document.cookie="oneSessionId=${oneSessionId}"; true;`;
    return (
      <>
        <WebView
          injectedJavaScript={js}
          sharedCookiesEnabled
          useWebKit={false}
          scrollEnabled={false}
          hideKeyboardAccessoryView
          keyboardDisplayRequiresUserAction={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={!useContainer}
          style={[styles.webview, style]}
          {...rest}
          ref={that.setRef}
          onMessage={that.onMessage}
          originWhitelist={['*']}
          dataDetectorTypes="none"
          domStorageEnabled={false}
          bounces={false}
          javaScriptEnabled
          originWhitelist={['*']}
          source={viewHTML}
          onLoad={that.init}
          onShouldStartLoadWithRequest={() => !that.htmlLoaded}
        />
        {Platform.OS === 'android' && <TextInput ref={ref => (that._input = ref)} style={styles._input} />}
      </>
    );
  }

  onViewLayout({ nativeEvent: { layout } }) {
    // const {x, y, width, height} = layout;
    this.layout = layout;
  }

  render() {
    // Waiting for oneSessionId to be retrieved
    const { loading } = this.state;
    const { useContainer, style } = this.props;
    if (loading) return <LoadingIndicator />;
    // useContainer is an optional prop with default value of true
    // If set to true, it will use a View wrapper with styles and height.
    const { height } = this.state;
    if (useContainer)
      return (
        <View style={[style, { height }]} onLayout={this.onViewLayout}>
          {this.renderWebView()}
        </View>
      );
    // If set to false, it will not use a View wrapper
    return this.renderWebView();
  }

  //-------------------------------------------------------------------------------
  //--------------- Public API

  registerToolbar(listener) {
    this.selectionChangeListeners = [...this.selectionChangeListeners, listener];
  }

  setContentFocusHandler(listener) {
    this.focusListeners.push(listener);
  }

  setContentHTML(html) {
    this.sendAction(actions.content, 'setHtml', html);
  }

  setPlaceholder(placeholder) {
    this.sendAction(actions.content, 'setPlaceholder', placeholder);
  }

  setContentStyle(styles) {
    this.sendAction(actions.content, 'setContentStyle', styles);
  }

  setDisable(dis) {
    this.sendAction(actions.content, 'setDisable', !!dis);
  }

  blurContentEditor() {
    this.sendAction(actions.content, 'blur');
  }

  focusContentEditor() {
    this.showAndroidKeyboard();
    this.sendAction(actions.content, 'focus');
  }

  showAndroidKeyboard() {
    const that = this;
    if (Platform.OS === 'android') {
      !that._keyOpen && that._input.focus();
      that.webviewBridge?.requestFocus?.();
    }
  }

  insertImage(attributes, style) {
    this.sendAction(actions.insertImage, 'result', attributes, style);
  }

  insertVideo(attributes, style) {
    this.sendAction(actions.insertVideo, 'result', attributes, style);
  }

  insertText(text) {
    this.sendAction(actions.insertText, 'result', text);
  }

  insertHTML(html) {
    this.sendAction(actions.insertHTML, 'result', html);
  }

  insertLink(title, url) {
    if (url) {
      this.showAndroidKeyboard();
      this.sendAction(actions.insertLink, 'result', { title, url });
    }
  }

  injectJavascript(script) {
    return this.webviewBridge.injectJavaScript(script);
  }

  preCode(type) {
    this.sendAction(actions.code, 'result', type);
  }

  setFontSize(size) {
    this.sendAction(actions.fontSize, 'result', size);
  }

  setForeColor(color) {
    this.sendAction(actions.foreColor, 'result', color);
  }

  setHiliteColor(color) {
    this.sendAction(actions.hiliteColor, 'result', color);
  }

  setFontName(name) {
    this.sendAction(actions.fontName, 'result', name);
  }

  commandDOM(command) {
    if (command) {
      this.sendAction(actions.content, 'commandDOM', command);
    }
  }

  command(command) {
    if (command) {
      this.sendAction(actions.content, 'command', command);
    }
  }

  dismissKeyboard() {
    this._focus ? this.blurContentEditor() : Keyboard.dismiss();
  }

  get isKeyboardOpen() {
    return this._keyOpen;
  }

  init() {
    const that = this;
    const { initialFocus, initialContentHTML, placeholder, editorInitializedCallback, disabled } = that.props;
    initialContentHTML && that.setContentHTML(initialContentHTML);
    placeholder && that.setPlaceholder(placeholder);
    that.setDisable(disabled);
    editorInitializedCallback();
    // initial request focus
    initialFocus && !disabled && that.focusContentEditor();
    // no visible ?
    that.sendAction(actions.init);
  }

  async getContentHtml() {
    return new Promise((resolve, reject) => {
      this.contentResolve = resolve;
      this.contentReject = reject;
      this.sendAction(actions.content, 'postHtml');
      this.pendingContentHtml = setTimeout(() => {
        if (this.contentReject) {
          this.contentReject('timeout');
        }
      }, 5000);
    });
  }
}
