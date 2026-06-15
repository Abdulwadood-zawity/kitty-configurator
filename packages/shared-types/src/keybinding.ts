import { z } from 'zod';

const keyComboRegex = /^[a-zA-Z0-9+_\-\s]+$/u;

export const keybindingSchema = z
  .object({
    id: z.string().min(1),
    action: z.string().min(1),
    keys: z.string().regex(keyComboRegex, 'invalid key combo'),
    args: z.string().optional(),
  })
  .strict();

export type Keybinding = z.infer<typeof keybindingSchema>;
