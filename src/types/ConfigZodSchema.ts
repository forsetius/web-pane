import { z } from 'zod';
import { TargetWindow } from './TargetWindow.js';

export const ConfigZodSchema = z.object({
  defaultTarget: z.enum(TargetWindow),
  windows: z.record(
    z.enum(TargetWindow),
    z.object({
      x: z.int().nonnegative(),
      y: z.int().nonnegative(),
      width: z.int().nonnegative(),
      height: z.int().nonnegative(),
      alwaysOnTop: z.boolean(),
    }),
  ),
});
