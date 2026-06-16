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
  addCustomEntry: (entry: KittyConfig['customEntries'][number]) => void;
  updateCustomEntry: (index: number, patch: Partial<KittyConfig['customEntries'][number]>) => void;
  removeCustomEntry: (index: number) => void;
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
      addCustomEntry: (entry) =>
        set((s) => ({
          config: { ...s.config, customEntries: [...s.config.customEntries, entry] },
        })),
      updateCustomEntry: (index, patch) =>
        set((s) => ({
          config: {
            ...s.config,
            customEntries: s.config.customEntries.map((entry, i) =>
              i === index ? { ...entry, ...patch } : entry,
            ),
          },
        })),
      removeCustomEntry: (index) =>
        set((s) => ({
          config: {
            ...s.config,
            customEntries: s.config.customEntries.filter((_, i) => i !== index),
          },
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
      version: 3,
      // Older persisted configs may be missing newer fields (e.g. tab colors and
      // active_tab_font_style). Merge them with the defaults so required fields
      // are always present.
      migrate: (persisted) => {
        const state = persisted as { config?: Partial<KittyConfig> } | undefined;
        if (!state?.config) return { config: structuredClone(DEFAULT_CONFIG) } as State;
        const window = { ...DEFAULT_CONFIG.window, ...state.config.window };
        window.resizeStrategy = window.resizeStrategy === 'cell' ? 'cell' : 'simple';
        const tabBar = { ...DEFAULT_CONFIG.tabBar, ...state.config.tabBar };
        tabBar.position = tabBar.position === 'bottom' ? 'bottom' : 'top';
        return {
          config: {
            ...structuredClone(DEFAULT_CONFIG),
            ...state.config,
            window,
            tabBar,
          },
        } as State;
      },
    },
  ),
);
