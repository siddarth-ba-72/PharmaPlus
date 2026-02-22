import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BannerComponentView } from './BannerComponentView'
import type { BannerComponentProps } from '../../shared/props/PropModels'
import { useAuthStore } from '../../store/AuthStore'
import { useLogoutMutation, useUserProfileQuery } from '../../shared/queries/AuthQueries'

export const BannerComponent = () => {

    const navigate = useNavigate()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const firstName = useAuthStore((state) => state.user?.firstName ?? null)
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

    const bannerProps: BannerComponentProps = {
        isAuthenticated,
        firstName,
        isDropdownOpen,
        onUserNameClick: toggleDropdown,
        onProfileClick: handleProfileClick,
        onLogoutClick: handleLogout,
    }

    return <BannerComponentView {...bannerProps} />
}
