'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KittyConfig, Theme, Keybinding } from '@kitty-configurator/shared-types';
import { DEFAULT_CONFIG } from '@kitty-configurator/shared-types';
import {
  parseKittyConf,
  parseItermColors,
  configToConf,
  parsedToConfig,
} from '@kitty-configurator/conf-parser';

interface State {
  config: KittyConfig;
  setConfig: (c: KittyConfig) => void;
  setTheme: (t: Theme) => void;
  setFont: (f: Partial<KittyConfig['font']>) => void;
  setWindow: (w: Partial<KittyConfig['window']>) => void;
  setTabBar: (t: Partial<KittyConfig['tabBar']>) => void;
  setLayouts: (l: Partial<KittyConfig['layouts']>) => void;
  setMouse: (m: Partial<KittyConfig['mouse']>) => void;
  setScrollback: (s: Partial<KittyConfig['scrollback']>) => void;
  setPerformance: (p: Partial<KittyConfig['performance']>) => void;
  addKeybinding: (kb: Keybinding) => void;
  updateKeybinding: (id: string, patch: Partial<Keybinding>) => void;
  removeKeybinding: (id: string) => void;
  resetKeybindings: (kb: Keybinding[]) => void;
  importConfig: (text: string) => void;
  importIterm: (text: string) => void;
  reset: () => void;
  getSerializedConfig: () => string;
}

export const useConfigStore = create<State>()(
  persist(
    (set, get) => ({
      config: structuredClone(DEFAULT_CONFIG),
      setConfig: (c) => set({ config: c }),
      setTheme: (t) =>
        set((s) => ({
          config: { ...s.config, theme: t },
        })),
      setFont: (patch) =>
        set((s) => ({
          config: { ...s.config, font: { ...s.config.font, ...patch } },
        })),
      setWindow: (patch) =>
        set((s) => ({
          config: {
            ...s.config,
            window: { ...s.config.window, ...patch },
          },
        })),
      setTabBar: (patch) =>
        set((s) => ({
          config: { ...s.config, tabBar: { ...s.config.tabBar, ...patch } },
        })),
      setLayouts: (patch) =>
        set((s) => ({
          config: { ...s.config, layouts: { ...s.config.layouts, ...patch } },
        })),
      setMouse: (patch) =>
        set((s) => ({
          config: { ...s.config, mouse: { ...s.config.mouse, ...patch } },
        })),
      setScrollback: (patch) =>
        set((s) => ({
          config: { ...s.config, scrollback: { ...s.config.scrollback, ...patch } },
        })),
      setPerformance: (patch) =>
        set((s) => ({
          config: { ...s.config, performance: { ...s.config.performance, ...patch } },
        })),
      addKeybinding: (kb) =>
        set((s) => ({
          config: { ...s.config, keybindings: [...s.config.keybindings, kb] },
        })),
      updateKeybinding: (id, patch) =>
        set((s) => ({
          config: {
            ...s.config,
            keybindings: s.config.keybindings.map((k) => (k.id === id ? { ...k, ...patch } : k)),
          },
        })),
      removeKeybinding: (id) =>
        set((s) => ({
          config: {
            ...s.config,
            keybindings: s.config.keybindings.filter((k) => k.id !== id),
          },
        })),
      resetKeybindings: (kb) =>
        set((s) => ({ config: { ...s.config, keybindings: kb } })),
      importConfig: (text) => {
        const parsed = parseKittyConf(text);
        set({ config: parsedToConfig(parsed) });
      },
      importIterm: (text) => {
        const theme = parseItermColors(text);
        set((s) => ({ config: { ...s.config, theme } }));
      },
      reset: () => set({ config: structuredClone(DEFAULT_CONFIG) }),
      getSerializedConfig: () => configToConf(get().config),
    }),
    {
      name: 'kitty-configurator-config',
      version: 1,
    },
  ),
);
