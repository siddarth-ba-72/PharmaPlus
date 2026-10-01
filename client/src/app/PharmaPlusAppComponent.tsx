import { Navigate, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '../store/AuthStore'
import { useThemeStore } from '../store/ThemeStore'
import { useUserProfileQuery } from '../shared/queries/AuthQueries'
import { PharmaPlusAppComponentView } from './PharmaPlusAppComponentView'

const RequireAuthenticatedRoute = () => {
    const isInitialized = useAuthStore((state) => state.isInitialized)
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    if (!isInitialized) {
        return null
    }

    if (!isAuthenticated) {
        return <Navigate to="/pharma-plus/login" replace />
    }

    return <Outlet />
}

const RequireAdminRoute = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const isAdmin = useAuthStore((state) => state.user?.isAdmin)

    if (!isAuthenticated) {
        return <Navigate to="/pharma-plus/login" replace />
    }

    if (!isAdmin) {
        return <Navigate to="/pharma-plus/home" replace />
    }

    return <Outlet />
}

export const PharmaPlusAppComponent = () => {
    const initializeTheme = useThemeStore((state) => state.initializeTheme)

    useUserProfileQuery()

    useEffect(() => {
        initializeTheme()
    }, [initializeTheme])

    return (
        <PharmaPlusAppComponentView
            RequiredAuthComponent={<RequireAuthenticatedRoute />}
            RequiredAdminAuthComponent={<RequireAdminRoute />}
        />
    )
}
