import type { BannerComponentProps } from '../../shared/props/PropModels'
import { Link } from 'react-router-dom'

export const BannerComponentView = (props: BannerComponentProps) => {

    const {
        isAuthenticated,
        isAdmin,
        isDarkMode,
        username,
        firstName,
        navItems,
        isDropdownOpen,
        onUserNameClick,
        onToggleTheme,
        onDashboardClick,
        onProfileClick,
        onLogoutClick,
    } = props

    const getAvatarColor = (userName: string | null): string => {
        const source = userName ?? 'guest'
        let hash = 0
        for (let index = 0; index < source.length; index += 1) {
            hash = (hash << 5) - hash + source.charCodeAt(index)
            hash |= 0
        }
        const hue = Math.abs(hash) % 360
        return `hsl(${hue} 78% 42%)`
    }

    const avatarColor = getAvatarColor(username)

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 px-3 py-3 backdrop-blur sm:px-5 sm:py-4 dark:border-slate-800 dark:bg-slate-950/85">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex w-full items-center justify-between sm:w-auto sm:justify-start">
                    <h1 className="text-base font-extrabold tracking-tight text-emerald-700 sm:text-lg dark:text-emerald-300">
                        <Link to="/pharma-plus/home">PharmaPlus</Link>
                    </h1>
                    <button
                        type="button"
                        onClick={onToggleTheme}
                        className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 sm:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                    >
                        {isDarkMode ? 'Light' : 'Dark'}
                    </button>
                </div>
                <nav className="flex w-full flex-wrap items-center gap-2 sm:w-auto" aria-label="Primary">
                    {navItems.map((navItem) => (
                        <Link
                            key={navItem.to}
                            to={navItem.to}
                            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 sm:px-4 sm:py-2 sm:text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                        >
                            {navItem.label}
                        </Link>
                    ))}
                </nav>
                <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                    <button
                        type="button"
                        onClick={onToggleTheme}
                        className="hidden rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 sm:inline-flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                    >
                        {isDarkMode ? 'Light' : 'Dark'}
                    </button>
                    {isAuthenticated ? (
                        <div className="relative">
                            <button
                                type="button"
                                className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 sm:px-4 sm:py-2 sm:text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                                onClick={onUserNameClick}
                            >
                                <span
                                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] leading-none text-white"
                                    style={{ backgroundColor: avatarColor }}
                                    aria-hidden="true"
                                >
                                    ☺
                                </span>
                                {firstName ?? 'User'}
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 min-w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                            onClick={onDashboardClick}
                                        >
                                            Dashboard
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                        onClick={onProfileClick}
                                    >
                                        Profile
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                                        onClick={onLogoutClick}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/pharma-plus/login"
                            className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 sm:px-4 sm:py-2 sm:text-sm"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};
