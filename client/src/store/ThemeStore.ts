import { create } from 'zustand'
import type { ThemeStoreState } from '../shared/storetypes/ThemeStoreTypes'

const THEME_STORAGE_KEY = 'pharmaplus-theme'

const applyTheme = (isDark: boolean): void => {
    if (isDark) {
        document.documentElement.classList.add('dark')
        return
    }
    document.documentElement.classList.remove('dark')
}

export const useThemeStore = create<ThemeStoreState>((setState, getState) => ({
    isDark: false,
    initializeTheme: () => {
        const persisted = localStorage.getItem(THEME_STORAGE_KEY)
        const isDark =
            persisted === 'dark' || (!persisted && window.matchMedia('(prefers-color-scheme: dark)').matches)
        applyTheme(isDark)
        setState({ isDark })
    },
    toggleTheme: () => {
        const nextIsDark = !getState().isDark
        applyTheme(nextIsDark)
        localStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? 'dark' : 'light')
        setState({ isDark: nextIsDark })
    },
}))
