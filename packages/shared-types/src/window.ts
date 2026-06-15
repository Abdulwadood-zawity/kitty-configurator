import { z } from 'zod';

export const windowSettingsSchema = z
  .object({
    padding: z.object({
      top: z.number().min(0).max(200),
      right: z.number().min(0).max(200),
      bottom: z.number().min(0).max(200),
      left: z.number().min(0).max(200),
    }),
    opacity: z.number().min(0).max(1),
    blur: z.number().min(0).max(50),
    decorations: z.boolean(),
    resizeStrategy: z.enum(['simple', 'forced', 'cell', 'python']),
    confirmOSWindowClose: z.boolean(),
    windowLogoPath: z.string().optional(),
  })
  .strict();

export type WindowSettings = z.infer<typeof windowSettingsSchema>;

export const tabSettingsSchema = z
  .object({
    style: z.enum(['fade', 'separator', 'slant', 'powerline', 'hidden', 'custom']),
    position: z.enum(['top', 'bottom', 'left', 'right']),
    maxTitleLength: z.number().min(0).max(200),
    activityBell: z.boolean(),
    titleTemplate: z.string().optional(),
  })
  .strict();

export type TabSettings = z.infer<typeof tabSettingsSchema>;

export const layoutSettingsSchema = z
  .object({
    enabledLayouts: z.array(
      z.enum(['tall', 'fat', 'grid', 'horizontal', 'vertical', 'stack', 'splits']),
    ),
    activeLayoutAlias: z.string().optional(),
  })
  .strict();

export type LayoutSettings = z.infer<typeof layoutSettingsSchema>;
