import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ModuleType } from '../services/api'

interface AppState {
  selectedModule: ModuleType | 'all'
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  notificationsOpen: boolean
  searchOpen: boolean
  setSelectedModule: (module: ModuleType | 'all') => void
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  setSidebarMobileOpen: (v: boolean) => void
  setNotificationsOpen: (v: boolean) => void
  setSearchOpen: (v: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedModule: 'all',
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      notificationsOpen: false,
      searchOpen: false,
      setSelectedModule: (module) => set({ selectedModule: module }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setSidebarMobileOpen: (v) => set({ sidebarMobileOpen: v }),
      setNotificationsOpen: (v) => set({ notificationsOpen: v }),
      setSearchOpen: (v) => set({ searchOpen: v }),
    }),
    {
      name: 'iot-app',
      partialize: (state) => ({
        selectedModule: state.selectedModule,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
