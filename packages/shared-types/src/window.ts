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

const tabHexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/u, 'expected a 6-digit hex color like #1e1e2e');

export const tabSettingsSchema = z
  .object({
    style: z.enum(['fade', 'separator', 'slant', 'powerline', 'hidden', 'custom']),
    position: z.enum(['top', 'bottom', 'left', 'right']),
    maxTitleLength: z.number().min(0).max(200),
    activityBell: z.boolean(),
    titleTemplate: z.string().optional(),
    activeForeground: tabHexColor.optional(),
    activeBackground: tabHexColor.optional(),
    inactiveForeground: tabHexColor.optional(),
    inactiveBackground: tabHexColor.optional(),
    activeFontStyle: z.enum(['normal', 'bold', 'italic', 'bold-italic']),
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
