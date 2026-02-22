import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/AuthStore'
import { PharmaPlusAppComponentView } from './PharmaPlusAppComponentView'

export const PharmaPlusAppComponent = () => {

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isAdmin = useAuthStore((state) => state.user?.isAdmin);

    const requiredAuth = () => {
        if (!isAuthenticated) {
            return <Navigate to="/pharma-plus/login" replace />
        }
        return <Outlet />
    }

    const requiredAdminAuth = () => {
        if (!isAuthenticated) {
            return <Navigate to="/pharma-plus/login" replace />
        }
        if (!isAdmin) {
            return <Navigate to="/pharma-plus/home" replace />
        }
        return <Outlet />
    }

    return (
        <PharmaPlusAppComponentView RequiredAuthComponent={requiredAuth()} RequiredAdminAuthComponent={requiredAdminAuth()} />
    )
}
