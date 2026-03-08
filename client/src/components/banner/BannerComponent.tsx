import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BannerComponentView } from './BannerComponentView'
import type { BannerComponentProps, BannerNavItem } from '../../shared/props/PropModels'
import { useAuthStore } from '../../store/AuthStore'
import { useThemeStore } from '../../store/ThemeStore'
import { useLogoutMutation, useUserProfileQuery } from '../../shared/queries/AuthQueries'

export const BannerComponent = () => {

    const navigate = useNavigate()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const isAdmin = useAuthStore((state) => state.user?.isAdmin ?? false)
    const username = useAuthStore((state) => state.user?.username ?? null)
    const firstName = useAuthStore((state) => state.user?.firstName ?? null)
    const isDarkMode = useThemeStore((state) => state.isDark)
    const toggleTheme = useThemeStore((state) => state.toggleTheme)
    const { mutateAsync: logoutUser } = useLogoutMutation()

    useUserProfileQuery()

    const toggleDropdown = (): void => {
        setIsDropdownOpen((isOpen) => !isOpen)
    }

    const handleLogout = async (): Promise<void> => {
        try {
            await logoutUser()
            setIsDropdownOpen(false)
            navigate('/pharma-plus/home', { replace: true })
        } catch {
            setIsDropdownOpen(false)
        }
    }

    const handleProfileClick = (): void => {
        setIsDropdownOpen(false)
        navigate('/pharma-plus/profile', { replace: true })
    }

    const handleDashboardClick = (): void => {
        setIsDropdownOpen(false)
        navigate('/pharma-plus/admin', { replace: true })
    }

    const navItems: BannerNavItem[] = [
        {
            label: 'Medicines',
            to: '/pharma-plus/medicines',
        },
        ...(isAuthenticated
            ? [
                {
                    label: 'My Cart',
                    to: '/pharma-plus/cart',
                } as BannerNavItem,
            ]
            : []),
    ]

    const bannerProps: BannerComponentProps = {
        isAuthenticated,
        isAdmin,
        isDarkMode,
        username,
        firstName,
        navItems,
        isDropdownOpen,
        onUserNameClick: toggleDropdown,
        onToggleTheme: toggleTheme,
        onDashboardClick: handleDashboardClick,
        onProfileClick: handleProfileClick,
        onLogoutClick: handleLogout,
    }

    return <BannerComponentView {...bannerProps} />
}
