import * as React from 'react';
import { ColorValue, View } from 'react-native';

import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import DeviceInfo from 'react-native-device-info';
import ImagePicker from 'react-native-image-crop-picker';

import { AuthActiveAccount } from '../../../auth/model';
import { getSession } from '../../../auth/reducer';
import workspaceService, { IWorkspaceUploadParams } from '../../../workspace/service';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import BottomSheet, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { CustomNonModalBottomSheet } from '~/framework/components/modals/bottom-sheet/component';
import { BodyBoldText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import AudioRecorder from '~/framework/util/audioFiles/recorder';
import { LocalFile } from '~/framework/util/fileHandler';
import { FetchError, FetchErrorCode } from '~/framework/util/http/error';
import { IMedia } from '~/framework/util/media';
import { ArrayElement } from '~/utils/types';

interface MediaBottomSheetModalInternalData<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

type LocalMediaImportResult = LocalFile[];

interface MediaImportChoiceOption {
  onPress: () => Promise<LocalMediaImportResult>;
  i18n: string;
  icon: string;
}

type MediaImportChoices = {
  options: MediaImportChoiceOption[];
  element?: React.ReactNode;
  title: { color: ColorValue; i18n: string; icon: string };
};
type MediaImportChoicesHook = () => MediaImportChoices;

const allowedMediaTypes: IMedia['type'][] = ['image', 'audio', 'video'];
type MediaImportChoicesHookByType = Record<ArrayElement<typeof allowedMediaTypes>, MediaImportChoicesHook>;
type PartialMediaImportChoicesHookByType = Partial<
  Record<
    ArrayElement<typeof allowedMediaTypes>,
    () => Omit<MediaImportChoices, 'title'> & Pick<Partial<MediaImportChoices>, 'title'>
  >
>;
type MediaImportChoicesByType = Record<ArrayElement<typeof allowedMediaTypes>, MediaImportChoices>;

const useDefaultMediaImportChoicesByType: MediaImportChoicesHookByType = {
  audio: () => {
    // utiliser createRef ici au lieu de useRef car cette fonction sera appelée au sein d'un useMemo().
    const audioRecordBottomSheetRef = React.createRef<BottomSheetMethods>();

    return {
      element: (
        <>
          <CustomNonModalBottomSheet ref={audioRecordBottomSheetRef}>
            <View style={{ height: 400 }}>
              <BodyBoldText>BONJOUR</BodyBoldText>
              <AudioRecorder />
            </View>
          </CustomNonModalBottomSheet>
        </>
      ),
      options: [
        {
          i18n: 'From files',
          icon: 'ui-audio',
          onPress: async () => {
            return [];
          },
        },
        {
          i18n: 'Record audio',
          icon: 'ui-audio',
          // onPress: async () => {
          //   const video = await ImagePicker.openCamera({
          //     mediaType: 'video',
          //   });
          //   return [
          //     new LocalFile({
          //       filename: video.filename ?? video.path.split('/').at(-1)?.split('.').at(0) ?? 'file',
          //       filepath: video.path,
          //       fileSize: video.size,
          //     }),
          //   ];
          // },
          onPress: async () => {
            audioRecordBottomSheetRef.current?.expand();
            return [];
          },
        },
      ],
      title: { color: theme.palette.complementary.purple.regular, i18n: 'Choose audio', icon: 'ui-audio' },
    };
  },
  // options: [
  //   { i18n: 'From files', icon: 'ui-audio', onPress: async () => [] },
  //   { i18n: 'Record audio', icon: 'ui-audio', onPress: async () => [] },
  // ],
  // title: { color: theme.palette.complementary.green.regular, i18n: 'Choose audio', icon: 'ui-audio' },
  image: () => ({
    options: [
      { i18n: 'From galery', icon: 'ui-image', onPress: async () => [] },
      { i18n: 'Take picture', icon: 'ui-camera', onPress: async () => [] },
    ],
    title: { color: theme.palette.complementary.blue.regular, i18n: 'Choose image', icon: 'ui-audio' },
  }),
  video: () => {
    // utiliser createRef ici au lieu de useRef car cette fonction sera appelée au sein d'un useMemo().
    const bottomSheetRef = React.createRef<BottomSheetModalMethods>();
    return {
      element: (
        <>
          <BottomSheet ref={bottomSheetRef}>
            <BodyBoldText>BONJOUR</BodyBoldText>
          </BottomSheet>
        </>
      ),
      options: [
        {
          i18n: 'From galery',
          icon: 'ui-image',
          onPress: async () => {
            bottomSheetRef.current?.present();
            return [];
          },
        },
        {
          i18n: 'Record video',
          icon: 'ui-camera',
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
      ],
      title: { color: theme.palette.complementary.purple.regular, i18n: 'Choose video', icon: 'ui-video' },
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
) => {
  if (localMedia.length <= 0) return;
  else if (localMedia.length === 1) {
    const distantFile = await uploadSingleMedia(session, localMedia[0], uploadParams);
    return [distantFile];
  } else {
    // ToDo open media import modal and return promise
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
  const promiseExecutorRef = React.useRef<MediaBottomSheetModalInternalData<IMedia[] | undefined>>();

  const cancelMediaImport = React.useCallback(() => {
    promiseExecutorRef.current?.resolve(undefined);
  }, []);

  const dismissCurrentBottomSheet = React.useCallback(() => {
    currentBottomSheetRef.current?.dismiss();
  }, []);

  const onDismiss = React.useCallback(() => {
    cancelMediaImport();
    currentBottomSheetRef.current = null;
  }, [cancelMediaImport]);

  const onValidate = React.useCallback(
    async (callback: () => Promise<LocalMediaImportResult | undefined>) => {
      try {
        const localMedia = await callback();
        if (!localMedia || localMedia.length === 0) return cancelMediaImport();
        const session = getSession();
        if (!session) throw new FetchError(FetchErrorCode.NOT_LOGGED);
        const distantFiles = await uploadAllMedia(session, localMedia, uploadParams);
        if (!distantFiles) throw new FetchError(FetchErrorCode.BAD_RESPONSE);
        console.debug('DISTANT FILES', distantFiles);
        const media = distantFiles?.map(file => ({ mime: file.df.filetype, src: file.df.url, type: 'video' }) as IMedia);
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
    [cancelMediaImport, uploadParams],
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
              onDismiss={onDismiss}>
              <>
                <BodyBoldText>{I18n.get(completeChoicesByType[type].title.i18n)}</BodyBoldText>
                {completeChoicesByType[type].options.map(o => (
                  <PrimaryButton key={o.i18n} text={I18n.get(o.i18n)} action={() => onValidate(o.onPress)} />
                ))}
                <PrimaryButton text="Cancel" action={dismissCurrentBottomSheet} />
              </>
            </BottomSheet>
            {completeChoicesByType[type].element || null}
          </>
        ))}
      </>
    ),
    [dismissCurrentBottomSheet, completeChoicesByType, onDismiss, onValidate],
  );

  const prompt = React.useCallback(
    async (type: ArrayElement<typeof allowedMediaTypes>, opts?: { signal?: AbortSignal }) => {
      try {
        return await new Promise<IMedia[] | undefined>((resolve, reject) => {
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
