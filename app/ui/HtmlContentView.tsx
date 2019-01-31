/**
 * Component that displays HTML (converted as a JSX view with HtmlConverter/jsx)
 * Html Data can be passed directy with the `html` prop, or by url with the `source` attribute.
 * If `source` prop is provided, you must provide also `getContentFromResource`,
 * a function that return the html string from the data got by url with `source`.
 * Has a `opts` prop that are the HtmlConverter's options.
 */

import * as React from "react";
import { View } from "react-native";

import { Loading } from ".";
import { fetchJSONWithCache } from "../infra/fetchWithCache";
import HtmlConverterJsx, {
  IHtmlConverterJsxOptions
} from "../infra/htmlConverter/jsx2";

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
}

export class HtmlContentView extends React.Component<
  IHtmlContentViewProps,
  IHtmlContentViewState
> {
  public constructor(props) {
    super(props);
    this.state = {
      html: this.props.html || undefined,
      jsx: undefined
    };
  }

  public async componentDidMount() {
    await this.componentDidUpdate();
  }

  public async componentDidUpdate() {
    await this.compute();
  }

  public async compute() {
    if (!this.state.html) {
      if (!this.props.getContentFromResource)
        throw new Error(
          "HtmlContentView: You must provide `getContentFromResource` along with the `source` props."
        );
      // If there is no Html, try to load it.
      // console.log("load", this.props.source);
      const responseJson = await fetchJSONWithCache(this.props.source);
      this.setState({
        html: this.props.getContentFromResource(responseJson)
      });
    } else if (!this.state.jsx) {
      // Else, if there is not JSX, try to compute it.
      this.setState({
        jsx: HtmlConverterJsx(this.state.html, this.props.opts).render
      });
    }
  }

  public render() {
    const loadingComp = this.props.loadingComp || <Loading />;

    return <View>{this.state.jsx || loadingComp}</View>;
  }
}
