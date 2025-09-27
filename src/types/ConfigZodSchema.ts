import { z } from 'zod';
import { Lang } from './Lang.js';

const WindowSchema = z.object({
  visible: z.boolean(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  alwaysOnTop: z.boolean(),
});

export const ConfigZodSchema = z.object({
  panes: z.object({ main: WindowSchema }).catchall(WindowSchema),
  ui: z.object({
    lang: z.enum(Lang),
    showWindowFrame: z.boolean(),
    showAppMenu: z.boolean(),
    showInWindowList: z.boolean(),
  }),
});
