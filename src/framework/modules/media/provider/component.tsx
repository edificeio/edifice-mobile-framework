import * as React from 'react';
import { ColorValue } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import BottomSheet, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { BodyBoldText } from '~/framework/components/text';
import { IMedia } from '~/framework/util/media';
import { ArrayElement } from '~/utils/types';

interface MediaBottomSheetModalInternalData<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

interface MediaImportResult {
  foo: 'bar';
}

interface MediaImportChoiceOption {
  callback: () => Promise<MediaImportResult>;
  i18n: string;
  icon: string;
}

interface MediaImportChoice {
  options: MediaImportChoiceOption[];
  title: { color: ColorValue; i18n: string; icon: string };
}

const allowedMediaTypes: IMedia['type'][] = ['image', 'audio', 'video'];
const defaultMediaImportChoices: Record<ArrayElement<typeof allowedMediaTypes>, MediaImportChoice> = {
  audio: {
    options: [
      { callback: () => {}, i18n: 'From files', icon: 'ui-audio' },
      { callback: () => {}, i18n: 'Record audio', icon: 'ui-audio' },
    ],
    title: { color: theme.palette.complementary.green.regular, i18n: 'Choose audio', icon: 'ui-audio' },
  },
  image: {
    options: [
      { callback: () => {}, i18n: 'From galery', icon: 'ui-image' },
      { callback: () => {}, i18n: 'Take picture', icon: 'ui-camera' },
    ],
    title: { color: theme.palette.complementary.blue.regular, i18n: 'Choose image', icon: 'ui-audio' },
  },
  video: {
    options: [
      { callback: () => {}, i18n: 'From galery', icon: 'ui-image' },
      { callback: () => {}, i18n: 'Record video', icon: 'ui-camera' },
    ],
    title: { color: theme.palette.complementary.purple.regular, i18n: 'Choose video', icon: 'ui-video' },
  },
};

export const useMediaImport = (
  additionnalMediaImportChoices: Partial<Record<ArrayElement<typeof allowedMediaTypes>, Partial<MediaImportChoice>>> = {},
) => {
  const mediaImportChoices = React.useMemo(() => {
    const res: typeof defaultMediaImportChoices = { ...defaultMediaImportChoices };
    for (const type of allowedMediaTypes) {
      res[type] = {
        options: [...defaultMediaImportChoices[type]!.options, ...(additionnalMediaImportChoices[type]?.options ?? [])],
        title: { ...defaultMediaImportChoices[type]!.title, ...additionnalMediaImportChoices[type]?.title },
      };
    }
    return res;
  }, [additionnalMediaImportChoices]);

  console.debug('ijij', mediaImportChoices);

  const bottomSheetsRefs = React.useRef<Record<ArrayElement<typeof allowedMediaTypes>, null | BottomSheetModalMethods>>(
    Object.fromEntries(allowedMediaTypes.map(k => [k, null])) as Record<ArrayElement<typeof allowedMediaTypes>, null>,
  );
  const currentBottomSheetRef = React.useRef<null | BottomSheetModalMethods>(null);
  const promiseExecutorRef = React.useRef<MediaBottomSheetModalInternalData<MediaImportResult>>();

  const dismissCurrentBottomSheet = React.useCallback(() => {
    currentBottomSheetRef.current?.dismiss();
  }, []);

  const onDismiss = React.useCallback(() => {
    promiseExecutorRef.current?.reject('dismissed');
    currentBottomSheetRef.current = null;
  }, []);

  const onValidate = React.useCallback(async (callback: () => Promise<MediaImportResult>) => {
    try {
      const ret = await callback();
      promiseExecutorRef.current?.resolve(ret);
    } catch (e) {
      promiseExecutorRef.current?.reject(e);
    } finally {
      currentBottomSheetRef.current?.dismiss(); // Will call onDissmiss but Promise will be already resolved so no problem here.
      currentBottomSheetRef.current = null;
    }
  }, []);

  const element = React.useMemo(
    () => (
      <>
        {(Object.keys(mediaImportChoices) as typeof allowedMediaTypes).map(k => (
          <BottomSheet
            ref={ref => {
              bottomSheetsRefs.current[k] = ref;
            }}
            key={k}
            onDismiss={onDismiss}>
            <>
              <BodyBoldText>{I18n.get(mediaImportChoices[k].title.i18n)}</BodyBoldText>
              {mediaImportChoices[k].options.map(o => (
                <PrimaryButton key={o.i18n} text={I18n.get(o.i18n)} action={() => onValidate(o.callback)} />
              ))}
              <PrimaryButton text="Cancel" action={dismissCurrentBottomSheet} />
            </>
          </BottomSheet>
        ))}
      </>
    ),
    [dismissCurrentBottomSheet, mediaImportChoices, onDismiss, onValidate],
  );

  const prompt = React.useCallback(
    async (type: ArrayElement<typeof allowedMediaTypes>, opts?: { signal?: AbortSignal }) => {
      try {
        return await new Promise<MediaImportResult>((resolve, reject) => {
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
