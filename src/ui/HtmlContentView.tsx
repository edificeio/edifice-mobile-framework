/**
 * Component that displays HTML (converted as a JSX view with HtmlConverter/jsx)
 * Html Data can be passed directy with the `html` prop, or by url with the `source` attribute.
 * If `source` prop is provided, you must provide also `getContentFromResource`,
 * a function that return the html string from the data got by url with `source`.
 * Has a `opts` prop that are the HtmlConverter's options.
 */
import * as React from 'react';
import { View, ViewProps } from 'react-native';

import { connect } from 'react-redux';

import { IRemoteAttachment } from './Attachment';
import { AttachmentGroup } from './AttachmentGroup';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallItalicText } from '~/framework/components/text';
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import HtmlParserRN, { IHtmlParserRNOptions } from '~/framework/util/htmlParser/rn';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { Loading } from '~/ui/Loading';

export interface IHtmlContentViewProps extends ViewProps {
  session?: AuthLoggedAccount;
  navigation?: any;
  html?: string;
  source?: string;
  emptyMessage?: string | JSX.Element;
  opts?: IHtmlParserRNOptions;
  loadingComp?: JSX.Element;
  onHtmlError?: () => void;
  getContentFromResource?: (responseJson: any) => string;
  onDownload?: () => void;
  onError?: () => void;
  onOpen?: () => void;
  onDownloadAll?: () => void;
}

interface IHtmlContentViewState {
  loading?: boolean; // Is resource loading?
  done?: boolean; // Is content fully loaded?
  error?: boolean; // Has loading ressource failed?
  html?: string; // Loaded html
  attachments: IRemoteAttachment[]; // Attachments in html
  jsx?: JSX.Element; // Computed jsx
}

class HtmlContentView extends React.PureComponent<IHtmlContentViewProps, IHtmlContentViewState> {
  public constructor(props: IHtmlContentViewProps | Readonly<IHtmlContentViewProps>) {
    super(props);
    this.state = {
      attachments: [],
      done: false,
      error: false,
      html: this.props.html ?? undefined,
      jsx: undefined,
      loading: false,
    };
  }

  public async componentDidMount() {
    await this.componentDidUpdate();
  }

  public async componentDidUpdate() {
    const { onHtmlError } = this.props;
    const { jsx } = this.state;
    if (jsx) return;
    try {
      await this.compute();
    } catch (e) {
      this.setState({ error: true });
      if (onHtmlError) onHtmlError();
      throw e;
    }
  }

  public generateAttachments(html: string) {
    const { session } = this.props;
    const attachmentGroupRegex = /<div class="download-attachments">.*?<\/a><\/div><\/div>/g;
    const attachmentGroupsHtml = html.match(attachmentGroupRegex);
    const attachmentsHtml = attachmentGroupsHtml && attachmentGroupsHtml.join().match(/<a.*?>.*?<\/a>/g);
    const attachments =
      attachmentsHtml &&
      attachmentsHtml.map(attHtml => {
        const attUrl = attHtml.match(/href="(.*?)"/g);
        const attDisplayName = attHtml.match(/<\/div>.*?<\/a>/g);
        return {
          displayName: attDisplayName && attDisplayName[0].replace(/<\/div>/g, '').replace(/<\/a>/g, ''),
          url: attUrl && `${session?.platform?.url}${attUrl[0].replace('href="', '').replace('"', '')}`,
        } as IRemoteAttachment;
      });
    html = html.replace(attachmentGroupRegex, '');
    this.setState({ html });
    if (attachments) this.setState({ attachments });
  }

  public async compute() {
    const { done, html, jsx, loading } = this.state;
    const { getContentFromResource, onHtmlError, opts, source } = this.props;
    const hasAttachments = html && html.includes('<div class="download-attachments">');
    if (done) return;
    this.setState({ loading: true });

    if (html === undefined) {
      // If there is no Html, try to load it
      if (!getContentFromResource || !source)
        throw new Error(
          "HtmlContentView: When the html prop isn't provided, you must provide both the `getContentFromResource` and `source` props."
        );
      if (loading) return;

      const responseJson = await fetchJSONWithCache(source);
      const responseHtml = getContentFromResource(responseJson);

      if (!responseHtml) {
        this.setState({ error: true });
        if (onHtmlError) onHtmlError();
      } else this.setState({ html: responseHtml });
    } else if (!jsx) {
      // Else, if there is not JSX, try to compute it
      if (hasAttachments) {
        this.generateAttachments(html);
      } else {
        const htmlParser = new HtmlParserRN(opts);
        this.setState({
          done: true,
          jsx: htmlParser.parse(html) as JSX.Element,
        });
      }
    }
  }

  public render() {
    const { attachments, error, jsx, loading } = this.state;
    const { emptyMessage, loadingComp, onDownload, onDownloadAll, onError, onOpen } = this.props;
    const hasContent = jsx && jsx.props.children.some((child: any) => child !== undefined && child != null);
    const loadingComponent = loadingComp || <Loading />;
    const hasAttachments = attachments && attachments.length;

    if (error) {
      return (
        <View {...this.props}>
          <SmallItalicText>{I18n.get('htmlcontentview-errorloadingresource')}</SmallItalicText>
        </View>
      );
    } else if (!loading && !hasContent) {
      return typeof emptyMessage === 'string' ? (
        <View {...this.props}>
          <SmallItalicText>{emptyMessage}</SmallItalicText>
        </View>
      ) : (
        emptyMessage || <SmallItalicText>{I18n.get('htmlcontentview-nocontent')}</SmallItalicText>
      );
    } else {
      return (
        <>
          <View {...this.props}>{jsx || loadingComponent}</View>
          {hasAttachments ? (
            <AttachmentGroup
              attachments={attachments}
              containerStyle={{ marginTop: UI_SIZES.spacing.small }}
              onDownload={onDownload}
              onError={onError}
              onDownloadAll={onDownloadAll}
              onOpen={onOpen}
            />
          ) : null}
        </>
      );
    }
  }
}

const mapStateToProps: (state: IGlobalState) => {
  session?: AuthLoggedAccount;
} = state => {
  return { session: getSession() };
};

export default connect(mapStateToProps, undefined)(HtmlContentView);
