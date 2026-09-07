import { UI_SIZES } from '~/framework/components/constants';
import { TABBED_PANEL_CURVE_SIZE } from '~/framework/modules/widgets/components/constants';

import type { TabbedPanelPathProps } from './types';

export const TABBED_PANEL_STROKE = UI_SIZES.border.thin;

// Corner turning the same way as the path.
const turn = (r: number, x: number, y: number) => `A ${r} ${r} 0 0 1 ${x} ${y}`;
// Corner turning against it, which no border radius can do.
const turnIn = (r: number, x: number, y: number) => `A ${r} ${r} 0 0 0 ${x} ${y}`;

/**
 * The outline of the panel and of the tab standing on it, as one path: no two shapes meet, so no
 * seam can show between them.
 *
 * It runs clockwise from the left edge. Coordinates are inset by half the stroke, SVG centring it
 * on the path. A tab reaching an edge of the panel simply skips the curve on that side.
 */
export function buildTabbedPanelPath({ height, radius, tab, width }: TabbedPanelPathProps) {
  const corner = radius?.corner ?? UI_SIZES.radius.mediumPlus;
  const half = TABBED_PANEL_STROKE / 2;
  const [left, top, right, bottom] = [half, half, width - half, height - half];
  const path: string[] = [];

  if (!tab) {
    path.push(
      `M ${left} ${top + corner}`,
      turn(corner, left + corner, top),
      `L ${right - corner} ${top}`,
      turn(corner, right, top + corner),
    );
  } else {
    // The line the tab meets the panel on, and the sides it stands between.
    const junction = tab.height;
    const start = Math.max(left, tab.x);
    const end = Math.min(right, tab.x + tab.width);
    // Never wider than half the tab, whatever it was asked to be.
    const curve = Math.min(radius?.curve ?? TABBED_PANEL_CURVE_SIZE, (end - start) / 2);

    if (start <= left) {
      path.push(`M ${left} ${top + corner}`, turn(corner, left + corner, top));
    } else {
      path.push(
        `M ${left} ${junction + corner}`,
        turn(corner, left + corner, junction),
        `L ${start - curve} ${junction}`,
        turnIn(curve, start, junction - curve),
        `L ${start} ${top + corner}`,
        turn(corner, start + corner, top),
      );
    }

    path.push(`L ${end - corner} ${top}`, turn(corner, end, top + corner));

    if (end < right) {
      path.push(
        `L ${end} ${junction - curve}`,
        turnIn(curve, end + curve, junction),
        `L ${right - corner} ${junction}`,
        turn(corner, right, junction + corner),
      );
    }
  }

  path.push(
    `L ${right} ${bottom - corner}`,
    turn(corner, right - corner, bottom),
    `L ${left + corner} ${bottom}`,
    turn(corner, left, bottom - corner),
    'Z',
  );

  return path.join(' ');
}
