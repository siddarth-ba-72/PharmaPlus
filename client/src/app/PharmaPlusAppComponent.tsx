import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '../store/AuthStore'
import { useThemeStore } from '../store/ThemeStore'
import { useToastStore } from '../store/ToastStore'
import { PharmaPlusAppComponentView } from './PharmaPlusAppComponentView'

const RequireAuthenticatedRoute = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const showToast = useToastStore((state) => state.showToast)
    const location = useLocation()

    useEffect(() => {
        if (isAuthenticated) {
            return
        }

        showToast({
            category: 'fail',
            message: 'Please login to access this page.',
        })
    }, [isAuthenticated, showToast, location.pathname])

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
