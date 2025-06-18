import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

import { MediaBottomSheetModalInternalData } from '~/framework/modules/media/hooks/import/types';
import { LocalFile } from '~/framework/util/fileHandler';

export interface AudioPlayerProps {
  audioFile: LocalFile;
  promiseExecutorRef?: React.RefObject<MediaBottomSheetModalInternalData<LocalFile[]>>;
  bottomSheetRef?: React.RefObject<BottomSheetMethods>;
  recordedBarsForPlayer: number[];
  resetRecorder: () => void;
}
