import { z } from 'zod';
import { themeSchema } from './theme.js';
import { fontSettingsSchema } from './font.js';
import { keybindingSchema } from './keybinding.js';
import { windowSettingsSchema, tabSettingsSchema, layoutSettingsSchema } from './window.js';
import { mouseSettingsSchema, scrollbackSettingsSchema, performanceSettingsSchema } from './advanced.js';

export const kittyConfigSchema = z
  .object({
    theme: themeSchema,
    font: fontSettingsSchema,
    keybindings: z.array(keybindingSchema),
    window: windowSettingsSchema,
    tabBar: tabSettingsSchema,
    layouts: layoutSettingsSchema,
    mouse: mouseSettingsSchema,
    scrollback: scrollbackSettingsSchema,
    performance: performanceSettingsSchema,
    /** Raw key/value pairs that don't map to a known field, preserved for round-trip. */
    customEntries: z.array(
      z.object({
        key: z.string(),
        values: z.array(z.string()),
        line: z.number().int().nonnegative().optional(),
      }),
    ),
  })
  .strict();

export type KittyConfig = z.infer<typeof kittyConfigSchema>;
