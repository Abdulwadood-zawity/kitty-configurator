import { z } from 'zod';

export const fontSettingsSchema = z
  .object({
    family: z.string().min(1),
    size: z.number().min(4).max(72),
    lineHeight: z.number().min(0.5).max(3),
    letterSpacing: z.number().min(-5).max(20),
    disableLigatures: z.boolean(),
    boldFontFamily: z.string().optional(),
    italicFontFamily: z.string().optional(),
    boldItalicFontFamily: z.string().optional(),
  })
  .strict();

export type FontSettings = z.infer<typeof fontSettingsSchema>;
