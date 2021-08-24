import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';
import { ActivityIndicator, Text, View, ViewStyle, Platform } from 'react-native';
import Permissions, { PERMISSIONS } from 'react-native-permissions';
import Filesize from 'filesize';
import Mime from 'mime';

import { CommonStyles } from '../styles/common/styles';
import { getAuthHeader } from '../infra/oauth';
import { ButtonsOkCancel, Icon } from '.';
import { TouchableOpacity as RNGHTouchableOpacity } from 'react-native-gesture-handler';
import { ModalBox, ModalContent, ModalContentBlock, ModalContentText } from './Modal';
import { notifierShowAction } from '../infra/notifier/actions';
import Notifier from '../infra/notifier/container';
import { IconButton } from './IconButton';
import { mainNavNavigate } from '../navigation/helpers/navHelper';
import { IDistantFile, LocalFile, SyncedFile } from '../framework/util/fileHandler';
import fileTransferService from '../framework/util/fileHandler/service';
import { ThunkDispatch } from 'redux-thunk';
import { IGlobalState } from '../AppStore';
import { getUserSession } from '../framework/util/session';
import { legacyAppConf } from '../framework/util/appConf';

export interface IRemoteAttachment {
  charset?: string;
  contentTransferEncoding?: string;
  contentType?: string;
  displayName?: string;
  filename?: string;
  id?: string;
  size?: number; // in Bytes
  url: string;
}

export interface ILocalAttachment {
  mime: string;
  name: string;
  uri: string;
}

export enum DownloadState {
  Idle = 0,
  Downloading,
  Success,
  Error,
}

// const dirs = RNFetchBlob.fs.dirs;
const attachmentIconsByFileExt: Array<{
  exts: string[];
  icon: string;
}> = [
    {
      exts: ['doc', 'docx'],
      icon: 'file-word',
    },
    { exts: ['xls', 'xlsx'], icon: 'file-excel' },
    {
      exts: ['ppt', 'pptx'],
      icon: 'file-powerpoint',
    },
    {
      exts: ['pdf'],
      icon: 'file-pdf',
    },
    {
      exts: ['zip', 'rar', '7z'],
      icon: 'file-archive',
    },
    {
      exts: ['png', 'jpg', 'jpeg', 'gif', 'tif', 'tiff', 'bmp', 'heif', 'heic'],
      icon: 'picture',
    },
  ];
const defaultAttachmentIcon = 'attached';
const getAttachmentTypeByExt = (filename: string) => {
  // from https://stackoverflow.com/a/12900504/6111343
  const ext = filename
    // tslint:disable-next-line:no-bitwise
    .slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
    .toLowerCase();

  let icon: string = defaultAttachmentIcon; // default returned value if no one match
  attachmentIconsByFileExt.map(type => {
    if (type.exts.includes(ext)) icon = type.icon;
  });

  return icon;
};
const openFile = (notifierId: string, file?: SyncedFile) => {
  return (dispatch) => {
    if (file) {
      file.open();
    }
  }
  /*return (dispatch) => {
    if (filePath) {
      if (Platform.OS === "ios") {
        (RNFetchBlob.ios.openDocument(filePath) as unknown as Promise<any>) // TS declaration for RNFetchBlob iOS is incomplete
          .catch(error => {
            dispatch(notifierShowAction({
              id: notifierId,
              text: I18n.t(error.message.includes("not supported")
                ? "download-error-unsupportedFileType"
                : "download-error-generic"
              ),
              type: 'warning'
            }));
          })
      } else if (Platform.OS === "android") {
        RNFetchBlob.android.actionViewIntent(filePath, Mime.getType(filePath) || "text/plain")
        // FIXME: implement catch (does not work on android, for now)
          // .catch(error => {
          //   dispatch(notifierShowAction({
          //     id: notifierId,
          //     text: I18n.t(error.message.includes("not supported")
          //       ? "download-error-unsupportedFileType"
          //       : "download-error-generic"
          //     ),
          //     type: 'warning'
          //   }));
          // })
      } else {
        // tslint:disable-next-line:no-console
        console.warn("Cannot handle file for devices other than ios/android.");
      }
    } else {
      dispatch(notifierShowAction({
        id: notifierId,
        text: I18n.t("download-error-generic"),
        type: 'warning',
      }));
    }
  }*/
};

class Attachment extends React.PureComponent<
  {
    attachment: IRemoteAttachment | ILocalAttachment;
    starDownload: boolean;
    style: ViewStyle;
    editMode?: boolean;
    onRemove?: () => void;
    onOpenFile: (notifierId: string, file?: LocalFile) => void;
    onDownload?: () => void;
    onError?: () => void;
    onOpen?: () => void;
    dispatch: ThunkDispatch<any, any, any>
  },
  {
    downloadState: DownloadState;
    progress: number; // From 0 to 1
    downloadedFile?: string;
    newDownloadedFile?: SyncedFile;
  }
> {
  get attId() {
    const { attachment, editMode } = this.props;
    return editMode
      ? (attachment as ILocalAttachment).uri && (attachment as ILocalAttachment).uri.split('/').pop()
      : (attachment as IRemoteAttachment).url && (attachment as IRemoteAttachment).url!.split('/').pop();
  }

  public constructor(props) {
    super(props);
    this.state = {
      downloadState: DownloadState.Idle,
      progress: 0
    };
  }

  public componentDidUpdate(prevProps: any) {
    const { starDownload, attachment } = this.props;
    const { downloadState } = this.state;
    const canDownload = this.attId && downloadState !== DownloadState.Success && downloadState !== DownloadState.Downloading;
    if (prevProps.starDownload !== starDownload) {
      canDownload && this.startDownload(attachment as IRemoteAttachment).catch(err => console.log(err));
    }
  }

  public render() {
    const { attachment: att, style, editMode, onRemove } = this.props;
    const { downloadState, progress } = this.state;
    const notifierId = `attachment/${this.attId}`;

    return (
      <View style={{ flex: 0 }}>
        <Notifier id={notifierId} />
        <RNGHTouchableOpacity
          onPress={() => this.onPressAttachment(notifierId)}
          style={{
            alignItems: 'center',
            flex: 0,
            flexDirection: 'row',
            ...style,
          }}>
          <View
            style={{
              backgroundColor: CommonStyles.primaryLight,
              height: '100%',
              position: 'absolute',
              width: downloadState === DownloadState.Success ? 0 : `${progress * 100}%`,
            }}
          />
          <View style={{ padding: 12, flex: 0, flexDirection: 'row', alignItems: 'center' }}>
            {downloadState === DownloadState.Downloading ? (
              <ActivityIndicator size="small" color={CommonStyles.primary} style={{ flex: 0, marginRight: 4, height: 18 }} />
            ) : downloadState === DownloadState.Success ? (
              <Icon color={CommonStyles.themeOpenEnt.green} size={16} name={'checked'} style={{ flex: 0, marginRight: 8 }} />
            ) : !this.attId || downloadState === DownloadState.Error ? (
              <Icon color={CommonStyles.errorColor} size={16} name={'close'} style={{ flex: 0, marginRight: 8 }} />
            ) : (
              <Icon
                color={CommonStyles.textColor}
                size={16}
                name={getAttachmentTypeByExt(
                  (editMode && (att as ILocalAttachment).name) ||
                  (att as IRemoteAttachment).filename ||
                  (att as IRemoteAttachment).displayName ||
                  '',
                )}
                style={{ flex: 0, marginRight: 8 }}
              />
            )}
            <Text
              style={{
                color: CommonStyles.textColor,
                flex: 1,
              }}
              numberOfLines={1}
              ellipsizeMode="middle">
              {downloadState === DownloadState.Error ? (
                <Text style={{ color: CommonStyles.errorColor }}>{I18n.t('download-error') + ' '}</Text>
              ) : null}
              <Text
                style={{
                  textDecorationColor:
                    downloadState === DownloadState.Success ? CommonStyles.textColor : CommonStyles.lightTextColor,
                  color: downloadState === DownloadState.Success ? CommonStyles.textColor : CommonStyles.lightTextColor,
                  textDecorationLine: 'underline',
                  textDecorationStyle: 'solid',
                }}>
                {(editMode && (att as ILocalAttachment).name) ||
                  (att as IRemoteAttachment).filename ||
                  (att as IRemoteAttachment).displayName ||
                  I18n.t('download-untitled')}{' '}
                {!this.attId && I18n.t('download-invalidUrl')}
              </Text>
            </Text>
            <Text
              style={{
                color: CommonStyles.lightTextColor,
                flex: 0,
              }}>
              {downloadState === DownloadState.Success
                ? ' ' + I18n.t('download-open')
                : downloadState === DownloadState.Error
                  ? ' ' + I18n.t('tryagain')
                  : null}
            </Text>
            {editMode ? (
              <RNGHTouchableOpacity onPress={() => onRemove && onRemove()}>
                <IconButton iconName="close" iconColor="#000000" buttonStyle={{ backgroundColor: CommonStyles.lightGrey }} />
              </RNGHTouchableOpacity>
            ) : null}
          </View>
        </RNGHTouchableOpacity>
      </View>
    );
  }

  public async onPressAttachment(notifierId: string) {
    const { onOpenFile, onOpen, attachment, editMode } = this.props;
    const { downloadState, newDownloadedFile } = this.state;
    const fileType = editMode
      ? (attachment as ILocalAttachment).mime
      : (attachment as IRemoteAttachment).contentType || (newDownloadedFile && getAttachmentTypeByExt(newDownloadedFile.filename));
    const toLocalFile = (att: ILocalAttachment) => new LocalFile({
      filename: att.name,
      filetype: att.mime,
      filepath: att.uri
    }, {_needIOSReleaseSecureAccess: false}) as LocalFile
    const file = editMode ? toLocalFile(attachment as ILocalAttachment) : newDownloadedFile;
    const carouselImage =
      Platform.OS === 'android'
        ? [{ src: { uri: 'file://' + file?.filepath }, alt: 'image' }]
        : [{ src: { uri: file?.filepath }, alt: 'image' }];

    if (!this.attId) {
      return undefined;
    } else if (editMode || downloadState === DownloadState.Success) {
      if (Platform.OS === 'android') {
        await Permissions.request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      }
      onOpen && onOpen();
      (fileType && fileType.startsWith('image')) || fileType === 'picture'
        ? mainNavNavigate('carouselModal', { images: carouselImage })
        : onOpenFile(notifierId, file);
    } else {
      this.startDownload(attachment as IRemoteAttachment).catch(err => console.log(err));
    }
  }

  // public getOriginalName(res: FetchBlobResponse, att: IRemoteAttachment) {
  //   const resHeaders = res.info().headers;
  //   const attachmentId = this.attId;

  //   if (att.filename) {
  //     return att.filename;
  //   } else {
  //     const contentDisposition = resHeaders['Content-Disposition'] || resHeaders['content-disposition'];
  //     const contentType = resHeaders['Content-Type'] || resHeaders['content-type'];
  //     return contentDisposition
  //       ? (contentDisposition as string).replace(/.*filename="(.*)"/, '$1')
  //       : contentType
  //         ? `${attachmentId}.${Mime.getExtension(contentType as string)}`
  //         : undefined;
  //   }
  // }

  public async startDownload(att: IRemoteAttachment) {
    // console.log("att", att);
    const df: IDistantFile = {
      ...att,
      filetype: att.contentType,
      fileid: att.id,
      filesize: att.size,
      filename: att.filename,
      url: att.url.replace(legacyAppConf.currentPlatform?.url!, '')
    };

    this.setState({
      downloadState: DownloadState.Downloading,
    });
    const downloadAction = (att: IDistantFile) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => {
      const session = getUserSession(getState());
      // console.log("action att", att);
      fileTransferService.downloadFile(session, att, {}, {
        onProgress: res => {
          this.setState({
            progress: res.bytesWritten / res.contentLength,
          });
        }
      }).then(lf => {
        this.setState({ newDownloadedFile: lf });
        this.props.onDownload && this.props.onDownload();
        this.setState({
          downloadState: DownloadState.Success,
          progress: 1,
        });
      })
        .catch(e => {
          console.log(e);
          this.props.onError && this.props.onError();
          this.setState({
            downloadState: DownloadState.Error,
            progress: 0,
          });
        });
    };
    this.props.dispatch(downloadAction(df));

    /*if (att.url) {
      if (Platform.OS === 'android') {
        const permissionRes = await Permissions.request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
        if (permissionRes !== 'granted') throw new Error(`Permission ${permissionRes} to write external storage`);
      }

      this.setState({
        downloadState: DownloadState.Downloading,
        showModal: false,
      });

      let fetchPromise;

      if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        // tslint:disable-next-line:no-console
        console.warn('Cannot handle file for devices other than ios/android.');
      } else {
        fetchPromise = RNFetchBlob.config({
          fileCache: true,
        })
          .fetch('GET', att.url, getAuthHeader())
          .progress((received, total) => {
            const fileSize = att.size || total;
            this.setState({
              progress: received / fileSize,
            });
            // TODO: wait for RNFetchBlob tu accept this PR (https://github.com/joltup/rn-fetch-blob/pull/558),
            // which solves an issue (https://github.com/joltup/rn-fetch-blob/issues/275) that prevents several
            // progress bars from being displayed in parallel (iOs-only)
          })
          .then(res => {
            // the temp file path
            const originalName = this.getOriginalName(res, att);
            const formattedOriginalName = originalName && originalName.replace(/\//g, '_');
            const baseDir = dirs.DocumentDir;
            const newpath = `${baseDir}/${formattedOriginalName}`;
            if (!originalName) throw new Error("file can't be saved (unknown name and extension)");

            RNFetchBlob.fs.exists(newpath).then(exists => {
              exists
                ? RNFetchBlob.fs
                    .unlink(newpath)
                    .then(() => RNFetchBlob.fs.mv(res.path(), newpath))
                    .then(() => this.setState({ downloadedFile: newpath }))
                    .catch(errorMessage => console.log(errorMessage))
                : RNFetchBlob.fs
                    .mv(res.path(), newpath)
                    .then(() => this.setState({ downloadedFile: newpath }))
                    .catch(errorMessage => console.log(errorMessage));
            });

            this.props.onDownload && this.props.onDownload();
          })
          .catch(errorMessage => {
            // error handling
            console.log(errorMessage);
            this.props.onError && this.props.onError();
          });
      }

      fetchPromise &&
        fetchPromise
          .then(res => {
            this.setState({
              downloadState: DownloadState.Success,
              progress: 1,
            });
          })
          .catch((errorMessage, statusCode) => {
            // error handling
            console.log('Error downloading', statusCode, errorMessage);
            this.setState({
              downloadState: DownloadState.Error,
              progress: 0,
            });
          });
    }*/
  }
}

export default connect(null, dispatch => ({
  onOpenFile: (notifierId: string, file: LocalFile) => dispatch(openFile(notifierId, file)),
  dispatch
}))(Attachment);
