/**
 * Component that displays HTML (converted as a JSX view with HtmlConverter/jsx)
 * Html Data can be passed directy with the `html` prop, or by url with the `source` attribute.
 * If `source` prop is provided, you must provide also `getContentFromResource`,
 * a function that return the html string from the data got by url with `source`.
 * Has a `opts` prop that are the HtmlConverter's options.
 */

import I18n from "i18n-js";
import * as React from "react";
import { View, ViewProps } from "react-native";

import { Loading } from ".";
import { fetchJSONWithCache } from "../infra/fetchWithCache";
import HtmlParserRN, { IHtmlParserRNOptions } from "../infra/htmlParser/rn";
import { Italic } from "./Typography";

export interface IHtmlContentViewProps extends ViewProps {
  navigation?: any;
  html?: string;
  source?: string;
  emptyMessage?: string | JSX.Element;
  opts?: IHtmlParserRNOptions;
  loadingComp?: JSX.Element;
  getContentFromResource?: (responseJson: any) => string;
}

interface IHtmlContentViewState {
  html?: string; // Loaded Html
  jsx?: JSX.Element; // Computed Jsx
  error?: boolean; // Has loading cressource failed ?
  loading?: boolean; // Is resource loading ?
  done?: boolean; // Is content fully loaded ?
}

export class HtmlContentView extends React.PureComponent<
  IHtmlContentViewProps,
  IHtmlContentViewState
> {
  public constructor(props) {
    super(props);
    this.state = {
      done: false,
      error: false,
      html: this.props.html || undefined,
      jsx: undefined,
      loading: false
    };
  }

  public async componentDidMount() {
    await this.componentDidUpdate();
  }

  public async componentDidUpdate() {
    // console.log("state", this.state);
    if (this.state.jsx) return;
    try {
      await this.compute();
    } catch (e) {
      this.setState({ error: true });
      throw e;
    }
  }

  public async compute() {
    if (this.state.done) return;
    this.setState({ loading: true });
    if (!this.state.html) {
      if (!this.props.getContentFromResource)
        throw new Error(
          "HtmlContentView: You must provide `getContentFromResource` along with the `source` props."
        );
      // If there is no Html, try to load it.
      // console.log("load", this.props.source);
      if (this.state.loading) return;
      const responseJson = await fetchJSONWithCache(this.props.source);
      // console.log("repsonse", responseJson);
      const html = this.props.getContentFromResource(responseJson);
      if (!html) this.setState({ error: true });
      else this.setState({ html });
    } else if (!this.state.jsx) {
      // Else, if there is not JSX, try to compute it.
      const htmlParser = new HtmlParserRN(this.props.opts);
      this.setState({
        done: true,
        jsx: htmlParser.parse(this.state.html) as JSX.Element
        // jsx: HtmlConverterJsx(this.state.html, this.props.opts).render
      });
    }
  }

  public render() {
    const { error, jsx,loading } = this.state
    const { loadingComp, emptyMessage} = this.props
    const hasContent = jsx && jsx.props.children.some((child: any) => child != undefined && child != null)
    const loadingComponent = loadingComp || <Loading />;

    if (error) {
      return (
        <View {...this.props}>
          <Italic>{I18n.t("common-ErrorLoadingResource")}</Italic>
        </View>
      );
    } else if (!loading && !hasContent) {
      return typeof emptyMessage === "string" ?
        <View {...this.props}>
          <Italic>{emptyMessage}</Italic>
        </View>
      : 
        emptyMessage || <Italic>{I18n.t("noContent")}</Italic>
    } else {
      return <View {...this.props}>{jsx || loadingComponent}</View>;
    }
  }
}
