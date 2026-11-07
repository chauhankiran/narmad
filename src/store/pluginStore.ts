import { create } from 'zustand'

export interface Plugin {
  id: string
  name: string
  version: string
  description: string
  author: string
  enabled: boolean
  hooks: PluginHooks
}

export interface PluginHooks {
  onActivate?: () => void
  onDeactivate?: () => void
  onFileOpen?: (path: string, content: string) => string | void
  onFileSave?: (path: string, content: string) => string | void
  onContentChange?: (content: string) => void
  commands?: PluginCommand[]
  statusBarItems?: StatusBarItem[]
}

export interface PluginCommand {
  id: string
  name: string
  shortcut?: string
  execute: () => void
}

export interface StatusBarItem {
  id: string
  content: string | (() => string)
  position: 'left' | 'right'
  onClick?: () => void
}

interface PluginState {
  plugins: Plugin[]
  registerPlugin: (plugin: Omit<Plugin, 'enabled'>) => void
  unregisterPlugin: (id: string) => void
  enablePlugin: (id: string) => void
  disablePlugin: (id: string) => void
  getEnabledPlugins: () => Plugin[]
  executeHook: <K extends keyof PluginHooks>(
    hookName: K,
    ...args: Parameters<NonNullable<PluginHooks[K]> extends (...args: infer P) => unknown ? (...args: P) => unknown : never>
  ) => void
}

export const usePluginStore = create<PluginState>((set, get) => ({
  plugins: [],

  registerPlugin: (plugin) => {
    set((state) => ({
      plugins: [...state.plugins, { ...plugin, enabled: true }],
    }))
    plugin.hooks.onActivate?.()
  },

  unregisterPlugin: (id) => {
    const plugin = get().plugins.find((p) => p.id === id)
    if (plugin?.enabled) {
      plugin.hooks.onDeactivate?.()
    }
    set((state) => ({
      plugins: state.plugins.filter((p) => p.id !== id),
    }))
  },

  enablePlugin: (id) => {
    const plugin = get().plugins.find((p) => p.id === id)
    if (plugin && !plugin.enabled) {
      plugin.hooks.onActivate?.()
      set((state) => ({
        plugins: state.plugins.map((p) =>
          p.id === id ? { ...p, enabled: true } : p
        ),
      }))
    }
  },

  disablePlugin: (id) => {
    const plugin = get().plugins.find((p) => p.id === id)
    if (plugin?.enabled) {
      plugin.hooks.onDeactivate?.()
      set((state) => ({
        plugins: state.plugins.map((p) =>
          p.id === id ? { ...p, enabled: false } : p
        ),
      }))
    }
  },

  getEnabledPlugins: () => {
    return get().plugins.filter((p) => p.enabled)
  },

  executeHook: (hookName, ...args) => {
    const enabledPlugins = get().getEnabledPlugins()
    for (const plugin of enabledPlugins) {
      const hook = plugin.hooks[hookName]
      if (typeof hook === 'function') {
        try {
          (hook as (...args: unknown[]) => unknown)(...args)
        } catch (error) {
          console.error(`Plugin ${plugin.name} error in ${hookName}:`, error)
        }
      }
    }
  },
}))

export const PluginAPI = {
  register: usePluginStore.getState().registerPlugin,
  unregister: usePluginStore.getState().unregisterPlugin,
  enable: usePluginStore.getState().enablePlugin,
  disable: usePluginStore.getState().disablePlugin,
}

if (typeof window !== 'undefined') {
  (window as unknown as { VistaPluginAPI: typeof PluginAPI }).VistaPluginAPI = PluginAPI
}
