/**
 * New implementation of Carousel built with our custom react-native-image-viewer !
 */
import getPath from '@flyerhq/react-native-android-uri-path';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, ImageURISource, Platform, StatusBar, StyleSheet } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PERMISSIONS, Permission, PermissionStatus, check, request } from 'react-native-permissions';
import Share from 'react-native-share';
import Toast from 'react-native-tiny-toast';
import { NavigationInjectedProps } from 'react-navigation';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import ImageViewer from '~/framework/components/carousel/image-viewer';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { FakeHeader, HeaderIcon } from '~/framework/components/header';
import PopupMenu from '~/framework/components/menus/popup';
import { PageView } from '~/framework/components/page';
import { LocalFile, SyncedFile } from '~/framework/util/fileHandler';
import fileTransferService from '~/framework/util/fileHandler/service';
import { FastImage, IMedia } from '~/framework/util/media';
import { getUserSession } from '~/framework/util/session';
import { urlSigner } from '~/infra/oauth';
import { Loading } from '~/ui/Loading';

export interface ICarouselNavParams {
  data: IMedia[];
  startIndex?: number;
}

export interface ICarouselProps extends NavigationInjectedProps<ICarouselNavParams> {}

const styles = StyleSheet.create({
  page: { backgroundColor: theme.palette.grey.black },
  header: {
    position: 'absolute',
    backgroundColor: theme.ui.shadowColorTransparent,
    zIndex: 10,
  },
  // eslint-disable-next-line react-native/no-color-literals
  closeButton: {
    width: UI_SIZES.dimensions.width.huge,
    height: UI_SIZES.dimensions.width.huge,
    padding: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    marginHorizontal: UI_SIZES.spacing.minor,
  },
  // eslint-disable-next-line react-native/no-color-literals
  errorScreen: {
    backgroundColor: 'transparent',
    height: UI_SIZES.screen.height,
    justifyContent: 'center',
  },
});

class PermissionError extends Error {
  value: PermissionStatus;

  permission: Permission;

  constructor(message: string, permission: Permission, value: PermissionStatus) {
    super(message);
    this.name = 'PermissionError';
    this.permission = permission;
    this.value = value;
  }
}

async function assertPermissions(permissions: Permission[]) {
  const permissionsResults = permissions.length > 0 ? await Promise.all(permissions.map(p => check(p))) : [];
  for (let [i, result] of permissionsResults.entries()) {
    if (result === 'denied') {
      result = await request(permissions[i]);
      permissionsResults[i] = result;
    }
    if (result === 'blocked') {
      throw new PermissionError(`[Permission] ${permissions[i]} blocked by the user.`, permissions[i], result);
    } else if (result === 'unavailable') {
      throw new PermissionError(`[Permission] ${permissions[i]} not available on this device.`, permissions[i], result);
    } else if (result === 'denied') {
      throw new PermissionError(`[Permission] ${permissions[i]} not granted yet by the user.`, permissions[i], result);
    }
  }
}

export const Buttons = ({ disabled, imageViewerRef }: { disabled: boolean; imageViewerRef }) => {
  return (
    <>
      <ActionButton
        text=""
        action={() => {
          Alert.alert(I18n.t('carousel.privacy.title'), I18n.t('carousel.privacy.text'), [
            {
              text: I18n.t('carousel.privacy.button'),
              onPress: () => imageViewerRef.current?.saveToLocal?.(),
            },
          ]);
        }}
        iconName="ui-download"
        style={styles.closeButton}
        disabled={disabled}
      />
      <PopupMenu
        actions={[
          {
            title: I18n.t('share'),
            action: () => {
              Alert.alert(I18n.t('carousel.privacy.title'), I18n.t('carousel.privacy.text'), [
                {
                  text: I18n.t('carousel.privacy.button'),
                  onPress: () => imageViewerRef.current?.share?.(),
                },
              ]);
            },
            icon: {
              ios: 'square.and.arrow.up',
              android: 'ic_share',
            },
          },
        ]}>
        <HeaderIcon name="more_vert" iconSize={26} />
      </PopupMenu>
    </>
  );
};

export function Carousel(props: ICarouselProps) {
  const { navigation } = props;
  const startIndex = navigation.getParam('startIndex') ?? 0;
  const data = React.useMemo(() => navigation.getParam('data') ?? [], [navigation]);
  const dataAsImages = React.useMemo(() => data.map(d => ({ url: '', props: { source: urlSigner.signURISource(d.src) } })), [data]);
  const isAttachmentLocal = dataAsImages[0].props.source.isLocal;

  const [isNavBarVisible, setNavBarVisible] = React.useState(true);

  const closeButton = React.useMemo(
    () => <ActionButton text="" action={navigation.goBack} iconName="ui-rafterLeft" style={styles.closeButton} />,
    [navigation],
  );

  const imageViewerRef = React.useRef<ImageViewer>();
  const getButtons = React.useCallback(
    (disabled: boolean) => <Buttons disabled={disabled} imageViewerRef={imageViewerRef} />,
    [imageViewerRef],
  );

  const downloadFile = React.useCallback(
    async (url: string | ImageURISource) => {
      const realUrl = urlSigner.getRelativeUrl(urlSigner.getSourceURIAsString(url));
      if (!realUrl) throw new Error('[Carousel] cannot download : no url provided.');
      const permissions = Platform.select<Permission[]>({
        ios: [],
        android: [PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE],
      })!;
      await assertPermissions(permissions);
      const foundData = data.find(d => (d.src = url));
      const sf = await fileTransferService.downloadFile(getUserSession(), { url: realUrl, filetype: foundData?.mime }, {});
      return sf;
    },
    [data],
  );

  const onSave = React.useCallback(
    async (url: string | ImageURISource) => {
      try {
        let sf: SyncedFile;
        try {
          const foundData = data.find(d => (d.src = url));
          const realUrl = urlSigner.getRelativeUrl(urlSigner.getSourceURIAsString(url));
          if (realUrl!.indexOf('file://') > -1) {
            sf = new SyncedFile(
              new LocalFile(
                { filepath: realUrl!, filetype: foundData?.mime!, filename: '' },
                { _needIOSReleaseSecureAccess: false },
              ),
              {
                url: realUrl!,
              },
            );
          } else {
            sf = await downloadFile(url);
          }
          if (!sf) return;
          const androidVersionMajor = Platform.OS === 'android' && parseInt(DeviceInfo.getSystemVersion().split('.')[0], 10);
          const permissions = Platform.select<Permission[]>({
            ios: [PERMISSIONS.IOS.PHOTO_LIBRARY, PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY],
            android:
              androidVersionMajor >= 13
                ? [PERMISSIONS.ANDROID.READ_MEDIA_IMAGES, PERMISSIONS.ANDROID.READ_MEDIA_VIDEO]
                : [PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE],
          })!;
          await assertPermissions(permissions);
        } catch (e) {
          if (e instanceof PermissionError) {
            Alert.alert(
              I18n.t('save.to.camera.roll.permission.blocked.title'),
              I18n.t('save.to.camera.roll.permission.blocked.text', { appName: DeviceInfo.getApplicationName() }),
            );
            return undefined;
          } else {
            throw e;
          }
        }
        const realFilePath = Platform.select({
          android: getPath(sf._filepathNative!),
          default: decodeURI(sf._filepathNative!),
        });
        if (Platform.OS === 'android') {
          await CameraRoll.save(realFilePath, { album: 'Download' }); // Will put in the actual folder "Download", but still displayed in "Camera" album :/
        } else {
          await CameraRoll.save(realFilePath);
        }
        Toast.showSuccess(I18n.t('save.to.camera.roll.success'));
      } catch {
        Toast.show(I18n.t('save.to.camera.roll.error'));
      }
    },
    [data, downloadFile],
  );

  const onShare = React.useCallback(
    async (url: string | ImageURISource) => {
      try {
        const sf = await downloadFile(url);
        if (!sf) return;
        await Share.open({
          type: sf.filetype || 'text/html',
          url: Platform.OS === 'android' ? 'file://' + sf.filepath : sf.filepath,
          showAppsToView: true,
        });
      } catch (e) {
        if (e instanceof PermissionError) {
          Alert.alert(
            I18n.t('share-permission-blocked-title'),
            I18n.t('share-permission-blocked-text', { appName: DeviceInfo.getApplicationName() }),
          );
          return undefined;
        } else {
          Toast.show(I18n.t('share-error'));
        }
      }
    },
    [downloadFile],
  );

  const loadingComponent = React.useMemo(() => <Loading />, []);
  const renderLoading = React.useCallback(() => loadingComponent, [loadingComponent]);

  const headerStyle = React.useMemo(() => [styles.header, { opacity: isNavBarVisible ? 1 : 0 }], [isNavBarVisible]);

  const renderImage = React.useCallback(imageProps => <FastImage {...imageProps} />, []);

  const renderFailImage = React.useCallback(imageProps => {
    return (
      <EmptyScreen
        customStyle={styles.errorScreen}
        svgImage="image-not-found"
        title=""
        text={I18n.t('carousel.image.not.found')}
        svgFillColor={theme.palette.grey.fog}
        textColor={theme.palette.grey.fog}
      />
    );
  }, []);

  return (
    <GestureHandlerRootView style={UI_STYLES.flex1}>
      <PageView navigation={navigation} style={styles.page} showNetworkBar={false}>
        <StatusBar backgroundColor={theme.ui.shadowColor} barStyle="light-content" />

        <ImageViewer
          ref={imageViewerRef as React.RefObject<ImageViewer>}
          enableSwipeDown
          show
          useNativeDriver
          imageUrls={dataAsImages}
          index={startIndex}
          onCancel={() => {
            navigation.goBack();
          }}
          onSave={onSave}
          onShare={onShare}
          renderImage={renderImage}
          loadingRender={renderLoading}
          loadWindow={1}
          renderIndicator={(current, total, imageStatus) => {
            return (
              <FakeHeader
                left={closeButton}
                style={headerStyle}
                title={total !== 1 ? I18n.t('carousel.counter', { current, total }) : ''}
                right={!isAttachmentLocal ? getButtons(imageStatus !== 'success') : null}
              />
            );
          }}
          saveToLocalByLongPress={false}
          onClick={() => {
            setNavBarVisible(!isNavBarVisible);
          }}
          renderFailImage={renderFailImage}
        />
      </PageView>
    </GestureHandlerRootView>
  );
}

export default Carousel;

export function openCarousel(props: ICarouselNavParams, navigation: NavigationInjectedProps['navigation']) {
  navigation.navigate('carouselModal', props);
}
