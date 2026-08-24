import type { IShades } from '~/app/theme';
import type { IAppBadgeInfo } from '~/framework/util/moduleTool';
import type { INotificationMedia } from '~/framework/util/notifications';

export interface NotificationPreviewProps {
  /** Icon and color of the app the notification comes from. */
  badge?: IAppBadgeInfo;
  /** Shades of that app. The pale one paints the block. */
  colors?: IShades;
  media: INotificationMedia[];
  /** What holds the content: the blog for a post, the wall for a note. */
  resourceName: string;
  text?: string;
  title?: string;
}
