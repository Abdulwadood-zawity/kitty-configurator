import { z } from 'zod';

export const mouseSettingsSchema = z
  .object({
    hideMouseWhenTyping: z.boolean(),
    mouseHideWait: z.number().min(0).max(60),
    focusFollowsMouse: z.boolean(),
    pointerShapeWhenGrabbed: z.enum(['arrow', 'beam', 'hand']),
    defaultPointerShape: z.enum(['arrow', 'beam', 'hand']),
  })
  .strict();

export type MouseSettings = z.infer<typeof mouseSettingsSchema>;

export const scrollbackSettingsSchema = z
  .object({
    lines: z.number().min(0).max(1_000_000),
    pager: z.string().optional(),
    fillEnum: z.enum(['default', 'filled', 'unlimited']),
    inSecondaryScreen: z.boolean(),
  })
  .strict();

export type ScrollbackSettings = z.infer<typeof scrollbackSettingsSchema>;

export const performanceSettingsSchema = z
  .object({
    repaintDelay: z.number().min(0).max(1000),
    syncToMonitor: z.boolean(),
  })
  .strict();

export type PerformanceSettings = z.infer<typeof performanceSettingsSchema>;
