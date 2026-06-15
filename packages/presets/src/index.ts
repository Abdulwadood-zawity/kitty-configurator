import type { Theme } from '@kitty-configurator/shared-types';
import catppuccinMocha from './themes/catppuccin-mocha.js';
import catppuccinLatte from './themes/catppuccin-latte.js';
import catppuccinFrappe from './themes/catppuccin-frappe.js';
import catppuccinMacchiato from './themes/catppuccin-macchiato.js';
import tokyoNight from './themes/tokyo-night-night.js';
import tokyoNightLight from './themes/tokyo-night-light.js';
import tokyoNightStorm from './themes/tokyo-night-storm.js';
import gruvboxDark from './themes/gruvbox-dark.js';
import gruvboxLight from './themes/gruvbox-light.js';
import solarizedDark from './themes/solarized-dark.js';
import solarizedLight from './themes/solarized-light.js';
import nord from './themes/nord.js';
import dracula from './themes/dracula.js';
import oneDark from './themes/one-dark.js';
import oneLight from './themes/one-light.js';
import rosePine from './themes/rose-pine.js';
import rosePineMoon from './themes/rose-pine-moon.js';
import rosePineDawn from './themes/rose-pine-dawn.js';
import kanagawa from './themes/kanagawa.js';
import ayuDark from './themes/ayu-dark.js';
import ayuLight from './themes/ayu-light.js';
import ayuMirage from './themes/ayu-mirage.js';
import everforestDark from './themes/everforest-dark.js';
import everforestLight from './themes/everforest-light.js';

export const themes: Theme[] = [
  catppuccinMocha,
  catppuccinLatte,
  catppuccinFrappe,
  catppuccinMacchiato,
  tokyoNight,
  tokyoNightLight,
  tokyoNightStorm,
  gruvboxDark,
  gruvboxLight,
  solarizedDark,
  solarizedLight,
  nord,
  dracula,
  oneDark,
  oneLight,
  rosePine,
  rosePineMoon,
  rosePineDawn,
  kanagawa,
  ayuDark,
  ayuLight,
  ayuMirage,
  everforestDark,
  everforestLight,
];

export const THEME_IDS = themes.map((t) => t.id);

export function getThemeById(id: string): Theme | undefined {
  return themes.find((t) => t.id === id);
}
