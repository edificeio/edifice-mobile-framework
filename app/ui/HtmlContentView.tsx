/**
 * Component that displays HTML (converted as a JSX view with HtmlConverter/jsx)
 * Html Data can be passed directy with the `html` prop, or by url with the `source` attribute.
 * If `source` prop is provided, you must provide also `getContentFromResource`,
 * a function that return the html string from the data got by url with `source`.
 * Has a `opts` prop that are the HtmlConverter's options.
 */

import I18n from "i18n-js";
import * as React from "react";
import { View } from "react-native";

import { Loading } from ".";
import { fetchJSONWithCache } from "../infra/fetchWithCache";
import HtmlConverterJsx, {
  IHtmlConverterJsxOptions
} from "../infra/htmlConverter/jsx2";
import { Italic } from "./Typography";

export interface IHtmlContentViewProps {
  navigation?: any;
  html?: string;
  source?: string;
  opts?: IHtmlConverterJsxOptions;
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
      this.setState({
        done: true,
        jsx: HtmlConverterJsx(this.state.html, this.props.opts).render
      });
    }
  }

  public render() {
    if (this.state.error)
      return (
        <View>
          <Italic>{I18n.t("common-ErrorLoadingResource")}</Italic>
        </View>
      );

    const loadingComp = this.props.loadingComp || <Loading />;

    return <View>{this.state.jsx || loadingComp}</View>;
  }
}
