import * as React from 'react';
import { View } from 'react-native';

import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import DeviceInfo from 'react-native-device-info';
import ImagePicker from 'react-native-image-crop-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import styles from './styles';
import {
  LocalMediaImportResult,
  MediaBottomSheetModalInternalData,
  MediaImportChoicesByType,
  MediaImportChoicesHookByType,
  MediaTypeList,
  PartialMediaImportChoicesHookByType,
} from './types';

import { I18n } from '~/app/i18n';
import GhostButton from '~/framework/components/buttons/ghost';
import BottomSheet, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { CustomNonModalBottomSheet } from '~/framework/components/modals/bottom-sheet/component';
import { BodyText, SmallBoldText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { mediaRouteNames } from '~/framework/modules/media/navigation';
import workspaceService, { IWorkspaceUploadParams } from '~/framework/modules/workspace/service';
import { usePromiseNavigate } from '~/framework/navigation/promise';
import AudioRecorder from '~/framework/util/audioFiles/recorder';
import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';
import { FetchError, FetchErrorCode } from '~/framework/util/http/error';
import { IMedia } from '~/framework/util/media';
import { ArrayElement } from '~/utils/types';

const allowedMediaTypes: MediaTypeList = ['image', 'audio', 'video'];

const useDefaultMediaImportChoicesByType: MediaImportChoicesHookByType = {
  audio: () => {
    // utiliser createRef ici au lieu de useRef car cette fonction sera appelée au sein d'un useMemo().
    const audioRecordBottomSheetRef = React.createRef<BottomSheetMethods>();
    const promiseExecutorRef = React.createRef<MediaBottomSheetModalInternalData<LocalFile[]>>() as React.MutableRefObject<
      MediaBottomSheetModalInternalData<LocalFile[]>
    >;

    return {
      element: (
        <>
          <CustomNonModalBottomSheet ref={audioRecordBottomSheetRef} enablePanDownToClose index={-1}>
            <View>
              <AudioRecorder
                onSave={promiseExecutorRef.current?.resolve}
                onCancel={() => {
                  promiseExecutorRef.current?.resolve([]);
                }}
                onError={promiseExecutorRef.current?.reject}
              />
            </View>
          </CustomNonModalBottomSheet>
        </>
      ),
      options: [
        {
          i18n: 'media-import-audio-from-microphone',
          icon: 'ui-mic',
          onPress: async () => {
            return new Promise<LocalMediaImportResult>((resolve, reject) => {
              promiseExecutorRef.current = { reject, resolve };
              audioRecordBottomSheetRef.current?.expand();
            });
          },
        },
        {
          i18n: 'media-import-audio-from-files',
          icon: 'ui-smartphone',
          onPress: async () => {
            return [];
          },
        },
      ],
      title: { i18n: 'media-import-audio-title' },
    };
  },
  image: () => ({
    options: [
      { i18n: 'media-import-image-from-camera', icon: 'ui-camera', onPress: async () => [] },
      { i18n: 'media-import-image-from-gallery', icon: 'ui-image', onPress: async () => [] },
    ],
    title: { i18n: 'media-import-image-title' },
  }),
  video: () => {
    // utiliser createRef ici au lieu de useRef car cette fonction sera appelée au sein d'un useMemo().
    return {
      options: [
        {
          i18n: 'media-import-video-from-camera',
          icon: 'ui-recordVideo',
          onPress: async () => {
            const video = await ImagePicker.openCamera({
              mediaType: 'video',
            });
            return [
              new LocalFile({
                filename: video.filename ?? video.path.split('/').at(-1)?.split('.').at(0) ?? 'file',
                filepath: video.path,
                fileSize: video.size,
              }),
            ];
          },
        },
        {
          i18n: 'media-import-video-from-gallery',
          icon: 'ui-smartphone',
          onPress: async () => {
            const videos = await ImagePicker.openPicker({
              maxFiles: 10,
              mediaType: 'video',
              multiple: true,
            });
            return videos.map(
              video =>
                new LocalFile({
                  filename: video.filename ?? video.path.split('/').at(-1)?.split('.').at(0) ?? 'file',
                  filepath: video.path,
                  fileSize: video.size,
                }),
            );
          },
        },
      ],
      title: { i18n: 'media-import-video-title' },
    };
  },
};

const uploadSingleMedia = async (session: AuthActiveAccount, file: LocalFile, uploadParams: IWorkspaceUploadParams) => {
  return workspaceService.file.uploadFile(session, file, uploadParams);
};

const uploadAllMedia = async (
  session: AuthActiveAccount,
  localMedia: LocalMediaImportResult,
  uploadParams: IWorkspaceUploadParams,
  uploadMultipleMedia: (
    session: AuthActiveAccount,
    files: LocalFile[],
    uploadParams: IWorkspaceUploadParams,
  ) => Promise<SyncedFileWithId[]>,
) => {
  if (localMedia.length <= 0) return;
  else if (localMedia.length === 1) {
    const distantFile = await uploadSingleMedia(session, localMedia[0], uploadParams);
    return [distantFile];
  } else {
    return uploadMultipleMedia(session, localMedia, uploadParams);
  }
};

export const useMediaImport = (
  uploadParams: IWorkspaceUploadParams,
  useAdditionnalMediaImportChoices: PartialMediaImportChoicesHookByType = {},
) => {
  const completeChoicesByType = React.useMemo(() => {
    const choicesByType = allowedMediaTypes.reduce<Partial<MediaImportChoicesByType>>((acc, type) => {
      const defaultChoicesOfType = useDefaultMediaImportChoicesByType[type]();
      acc[type] = defaultChoicesOfType;
      return acc;
    }, {}) as MediaImportChoicesByType;

    for (const type of allowedMediaTypes) {
      const additionnalChoicesOfType = useAdditionnalMediaImportChoices[type]?.();
      if (!additionnalChoicesOfType) continue;
      choicesByType[type].options.push(...additionnalChoicesOfType.options);
      if (choicesByType[type].element || additionnalChoicesOfType.element) {
        choicesByType[type].element = (
          <>
            {choicesByType[type].element}
            {additionnalChoicesOfType.element}
          </>
        );
      }
      if (additionnalChoicesOfType.title) {
        choicesByType[type].title = additionnalChoicesOfType.title;
      }
    }

    return choicesByType;
  }, [useAdditionnalMediaImportChoices]);

  const bottomSheetsRefs = React.useRef<Record<ArrayElement<typeof allowedMediaTypes>, null | BottomSheetModalMethods>>(
    Object.fromEntries(allowedMediaTypes.map(type => [type, null])) as Record<ArrayElement<typeof allowedMediaTypes>, null>,
  );
  const currentBottomSheetRef = React.useRef<null | BottomSheetModalMethods>(null);
  const promiseExecutorRef = React.useRef<MediaBottomSheetModalInternalData<IMedia[]>>();
  const cancelOnDismiss = React.useRef<boolean>(false);

  const cancelMediaImport = React.useCallback(() => {
    promiseExecutorRef.current?.resolve([]);
  }, []);

  const dismissCurrentBottomSheet = React.useCallback(() => {
    currentBottomSheetRef.current?.dismiss();
  }, []);

  const onDismiss = React.useCallback(() => {
    if (cancelOnDismiss.current) cancelMediaImport();
    currentBottomSheetRef.current = null;
  }, [cancelMediaImport]);

  const openImportModal = usePromiseNavigate(mediaRouteNames['import-queue']);
  const uploadMultiple = React.useCallback(
    (session: AuthActiveAccount, files: LocalFile[]) =>
      openImportModal(undefined, {
        files,
        uploadFn: (file: LocalFile) => {
          return uploadSingleMedia(session, file, uploadParams);
        },
      }),
    [openImportModal, uploadParams],
  );

  const formatMedia = React.useCallback(
    (type: IMedia['type'], files: SyncedFileWithId[]): IMedia[] =>
      files.map(file => ({ mime: file.df.filetype, src: file.df.url, type })),
    [],
  );

  const onValidate = React.useCallback(
    async (type: IMedia['type'], callback: () => Promise<LocalMediaImportResult>) => {
      try {
        cancelOnDismiss.current = false;
        currentBottomSheetRef.current?.dismiss();
        const localMedia = await callback();
        if (!localMedia || localMedia.length === 0) return cancelMediaImport();
        const session = getSession();
        if (!session) throw new FetchError(FetchErrorCode.NOT_LOGGED);
        const distantFiles = await uploadAllMedia(session, localMedia, uploadParams, uploadMultiple);
        if (!distantFiles) throw new FetchError(FetchErrorCode.BAD_RESPONSE);
        console.debug('DISTANT FILES', distantFiles);
        const media = formatMedia(type, distantFiles);
        console.debug('MEDIA', media);
        promiseExecutorRef.current?.resolve(media);
      } catch (e) {
        if (e instanceof Error) {
          switch (e.code) {
            case 'E_PICKER_CANCELLED':
              return cancelMediaImport();
            case 'E_PICKER_CANNOT_RUN_CAMERA_ON_SIMULATOR':
              toast.showError(I18n.get('media-cannot-use-camera-in-simulator'));
              break;
            case 'E_NO_LIBRARY_PERMISSION':
              toast.showError(I18n.get('media-permission-library-denied', { appName: DeviceInfo.getApplicationName() }));
              break;
            case 'E_NO_CAMERA_PERMISSION':
              toast.showError(I18n.get('media-permission-camera-denied', { appName: DeviceInfo.getApplicationName() }));
              break;
            // case 'E_NO_IMAGE_DATA_FOUND':
            //   break;
            // case 'E_ERROR_WHILE_CLEANING_FILES':
            //   break;
            // case 'E_CROPPER_IMAGE_NOT_FOUND':
            //   break;
            // case 'E_CANNOT_SAVE_IMAGE':
            //   break;
            // case 'E_CANNOT_PROCESS_VIDEO':
            //   break;
            // case 'E_ACTIVITY_DOES_NOT_EXIST':
            //   break;
            // case 'E_CALLBACK_ERROR':
            //   break;
            // case 'E_FAILED_TO_SHOW_PICKER':
            //   break;
            // case 'E_FAILED_TO_OPEN_CAMERA':
            //   break;
            // case 'E_CAMERA_IS_NOT_AVAILABLE':
            //   break;
            // case 'E_CANNOT_LAUNCH_CAMERA':
            //   break;
            default:
              toast.showError(I18n.get('media-unknown-error'));
              break;
          }
        }
        promiseExecutorRef.current?.reject(e);
      } finally {
        currentBottomSheetRef.current?.dismiss(); // Will call onDissmiss but Promise will be already resolved so no problem here.
        currentBottomSheetRef.current = null;
      }
    },
    [cancelMediaImport, formatMedia, uploadMultiple, uploadParams],
  );

  const element = React.useMemo(
    () => (
      <>
        {(Object.keys(completeChoicesByType) as typeof allowedMediaTypes).map(type => (
          <>
            <BottomSheet
              ref={ref => {
                bottomSheetsRefs.current[type] = ref;
              }}
              key={type}
              onDismiss={onDismiss}
              style={null}>
              <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
                <SmallBoldText style={styles.promptTitle}>{I18n.get(completeChoicesByType[type].title.i18n)}</SmallBoldText>
                {completeChoicesByType[type].options.map((o, i) => (
                  <>
                    <GhostButton
                      style={styles.button}
                      iconLeft={o.icon}
                      key={o.i18n}
                      text={I18n.get(o.i18n)}
                      action={() => onValidate(type, o.onPress)}
                      TextComponent={BodyText}
                    />
                    {i < completeChoicesByType[type].options.length - 1 ? <View style={styles.separator} /> : null}
                  </>
                ))}
              </SafeAreaView>
            </BottomSheet>
            {completeChoicesByType[type].element || null}
          </>
        ))}
      </>
    ),
    [completeChoicesByType, onDismiss, onValidate],
  );

  const prompt = React.useCallback(
    async (type: ArrayElement<typeof allowedMediaTypes>, opts?: { signal?: AbortSignal }) => {
      try {
        return await new Promise<IMedia[]>((resolve, reject) => {
          cancelOnDismiss.current = true;
          opts?.signal?.addEventListener('abort', onDismiss);
          promiseExecutorRef.current = { reject, resolve };
          currentBottomSheetRef.current = bottomSheetsRefs.current?.[type];
          bottomSheetsRefs.current?.[type]?.present({ reject, resolve });
        });
      } catch (e) {
        return Promise.reject(e);
      } finally {
        opts?.signal?.removeEventListener('abort', onDismiss);
      }
    },
    [onDismiss],
  );

  return { element, prompt };
};
