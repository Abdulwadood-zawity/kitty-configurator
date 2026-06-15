import { z } from 'zod';

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/u, 'expected a 6-digit hex color like #1e1e2e');

/**
 * 16 ANSI palette entries (0–15).
 * Kitty names them color0..color15.
 */
export const ansiPaletteSchema = z.object({
  color0: hexColor,
  color1: hexColor,
  color2: hexColor,
  color3: hexColor,
  color4: hexColor,
  color5: hexColor,
  color6: hexColor,
  color7: hexColor,
  color8: hexColor,
  color9: hexColor,
  color10: hexColor,
  color11: hexColor,
  color12: hexColor,
  color13: hexColor,
  color14: hexColor,
  color15: hexColor,
});

export type AnsiPalette = z.infer<typeof ansiPaletteSchema>;

export const themeSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    author: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    foreground: hexColor,
    background: hexColor,
    cursor: hexColor,
    cursorTextColor: hexColor,
    selectionBackground: hexColor,
    selectionForeground: hexColor,
    palette: ansiPaletteSchema,
  })
  .strict();

export type Theme = z.infer<typeof themeSchema>;
