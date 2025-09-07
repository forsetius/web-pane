import { z } from 'zod';
import { Lang } from './Lang.js';
import { TargetBrowsingWindow } from './TargetBrowsingWindow.js';

export const ConfigZodSchema = z.object({
  defaultTarget: z.enum(TargetBrowsingWindow),
  lang: z.enum(Lang),
  windows: z.record(
    z.enum(TargetBrowsingWindow),
    z.object({
      visible: z.boolean(),
      x: z.int().nonnegative(),
      y: z.int().nonnegative(),
      width: z.int().nonnegative(),
      height: z.int().nonnegative(),
      alwaysOnTop: z.boolean(),
    }),
  ),
  ui: z.object({
    showWindowFrame: z.boolean(),
    showAppMenu: z.boolean(),
    showInWindowList: z.boolean(),
  }),
});
