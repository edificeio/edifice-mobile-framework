/**
 * New implementation of Carousel built with our custom react-native-image-viewer !
 */
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
import { ActionButton } from '~/framework/components/ActionButton';
import ImageViewer from '~/framework/components/carousel/image-viewer';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { FakeHeader } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import { SyncedFile } from '~/framework/util/fileHandler';
import fileTransferService from '~/framework/util/fileHandler/service';
import { FastImage, IMedia } from '~/framework/util/media';
import { getUserSession } from '~/framework/util/session';
import { urlSigner } from '~/infra/oauth';
import { Loading } from '~/ui/Loading';

import { EmptyScreen } from '../emptyScreen';
import { NamedSVG } from '../picture';
import PopupMenu from '../popupMenu';

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

export const Buttons = ({ disabled, imageViewerRef, popupMenuRef }: { disabled: boolean; imageViewerRef; popupMenuRef }) => {
  const dotsButtons = React.useCallback(
    (onPress: () => void) => <ActionButton disabled={disabled} iconName="ui-options" style={styles.closeButton} action={onPress} />,
    [disabled],
  );
  return (
    <>
      <ActionButton
        action={() => {
          imageViewerRef.current?.saveToLocal?.();
        }}
        iconName="ui-download"
        style={styles.closeButton}
        disabled={disabled}
      />
      <PopupMenu
        button={dotsButtons}
        options={[
          {
            i18n: 'share',
            icon: (
              <NamedSVG
                name="ui-share"
                fill={theme.palette.grey.black}
                width={UI_SIZES.dimensions.width.large}
                height={UI_SIZES.dimensions.width.large}
                style={{ marginHorizontal: UI_SIZES.spacing.small }}
              />
            ),
            onClick: () => imageViewerRef.current?.share?.(),
          },
        ]}
        ref={popupMenuRef as React.LegacyRef<PopupMenu>} // Some type hack here...
        style={{
          top: UI_SIZES.elements.navbarHeight + UI_SIZES.spacing.minor,
        }}
      />
    </>
  );
};

export function Carousel(props: ICarouselProps) {
  const { navigation } = props;
  const startIndex = navigation.getParam('startIndex') ?? 0;
  const data = React.useMemo(() => navigation.getParam('data') ?? [], [navigation]);
  const dataAsImages = React.useMemo(() => data.map(d => ({ url: '', props: { source: urlSigner.signURISource(d.src) } })), [data]);

  const [isNavBarVisible, setNavBarVisible] = React.useState(true);

  const closeButton = React.useMemo(
    () => <ActionButton action={navigation.goBack} iconName="ui-rafterLeft" style={styles.closeButton} />,
    [navigation],
  );

  const imageViewerRef = React.useRef<ImageViewer>();
  const popupMenuRef = React.useRef<PopupMenu>();
  const getButtons = React.useCallback(
    (disabled: boolean) => <Buttons disabled={disabled} imageViewerRef={imageViewerRef} popupMenuRef={popupMenuRef} />,
    [popupMenuRef, imageViewerRef],
  );

  const downloadFile = React.useCallback(async (url: string | ImageURISource) => {
    const realUrl = urlSigner.getRelativeUrl(urlSigner.getSourceURIAsString(url));
    if (!realUrl) throw new Error('[Carousel] cannot download : no url provided.');
    const permissions = Platform.select<Permission[]>({
      ios: [],
      android: [PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE],
    })!;
    await assertPermissions(permissions);
    const sf = await fileTransferService.downloadFile(getUserSession(), { url: realUrl }, {});
    return sf;
  }, []);

  const onSave = React.useCallback(
    async (url: string | ImageURISource) => {
      try {
        let sf: SyncedFile;
        try {
          sf = await downloadFile(url);
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
        if (Platform.OS === 'android') {
          await CameraRoll.save(sf.filepath, { album: 'Download' }); // Will put in the actual folder "Download", but still displayed in "Camera" album :/
        } else {
          await CameraRoll.save(sf.filepath);
        }
        Toast.showSuccess(I18n.t('save.to.camera.roll.success'));
      } catch (e) {
        Toast.show(I18n.t('save.to.camera.roll.error'));
      }
    },
    [downloadFile],
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
            I18n.t('share.permission.blocked.title'),
            I18n.t('share.permission.blocked.text', { appName: DeviceInfo.getApplicationName() }),
          );
          return undefined;
        } else {
          Toast.show(I18n.t('share.error'));
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
                right={getButtons(imageStatus !== 'success')}
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

export function openCarousel(props: ICarouselNavParams, navigation: any) {
  navigation.navigate('carouselModal2', props);
}
