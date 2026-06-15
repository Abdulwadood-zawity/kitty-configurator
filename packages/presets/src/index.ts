import type { Theme } from '@kitty-configurator/shared-types';
import catppuccinMocha from './themes/catppuccin-mocha';
import catppuccinLatte from './themes/catppuccin-latte';
import catppuccinFrappe from './themes/catppuccin-frappe';
import catppuccinMacchiato from './themes/catppuccin-macchiato';
import tokyoNight from './themes/tokyo-night-night';
import tokyoNightLight from './themes/tokyo-night-light';
import tokyoNightStorm from './themes/tokyo-night-storm';
import gruvboxDark from './themes/gruvbox-dark';
import gruvboxLight from './themes/gruvbox-light';
import solarizedDark from './themes/solarized-dark';
import solarizedLight from './themes/solarized-light';
import nord from './themes/nord';
import dracula from './themes/dracula';
import oneDark from './themes/one-dark';
import oneLight from './themes/one-light';
import rosePine from './themes/rose-pine';
import rosePineMoon from './themes/rose-pine-moon';
import rosePineDawn from './themes/rose-pine-dawn';
import kanagawa from './themes/kanagawa';
import ayuDark from './themes/ayu-dark';
import ayuLight from './themes/ayu-light';
import ayuMirage from './themes/ayu-mirage';
import everforestDark from './themes/everforest-dark';
import everforestLight from './themes/everforest-light';

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
