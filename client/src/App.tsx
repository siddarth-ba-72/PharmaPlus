import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BannerComponent } from './components/banner/BannerComponent'
import { AuthComponent } from './components/auth/AuthComponent'
import { ProfileComponent } from './components/profile/ProfileComponent'
import { CounterComponent } from './components/counter/CounterComponent'

import './styles/App.css'

export const PharmaPlusUIApp = () => {

    return (
        <BrowserRouter>
            <BannerComponent />
            <section className="app-content">
                <Routes>
                    <Route path="/pharma-plus/home" element={<CounterComponent />} />
                    <Route path="/pharma-plus/login" element={<AuthComponent />} />
                    <Route path="/pharma-plus/profile" element={<ProfileComponent />} />
                    <Route path="*" element={<Navigate to="/pharma-plus/home" replace />} />
                </Routes>
            </section>
        </BrowserRouter>
    )
}