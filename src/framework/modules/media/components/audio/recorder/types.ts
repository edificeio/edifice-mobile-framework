import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

import type { MediaBottomSheetModalInternalData } from '~/framework/modules/media/hooks/import/types';
import { LocalFile } from '~/framework/util/fileHandler';

export interface AudioRecorderProps {
  promiseExecutorRef?: React.RefObject<MediaBottomSheetModalInternalData<LocalFile[]>>;
  bottomSheetRef?: React.RefObject<BottomSheetMethods>;
}
