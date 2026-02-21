import { Component } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './styles/App.css'
import BaseComponent from './components/home/BaseComponent'
import BannerContainer from './components/banner/BannerContainer'
import AuthContainer from './components/auth/AuthContainer'

class PharmaPlusUIApp extends Component {

    render() {

        return (
            <BrowserRouter>
                <main className="app">
                    <BannerContainer />
                    <section className="app-content">
                        <Routes>
                            <Route path="/pharma-plus/home" element={<BaseComponent />} />
                            <Route path="/pharma-plus/login" element={<AuthContainer />} />
                            <Route path="*" element={<Navigate to="/pharma-plus/home" replace />} />
                        </Routes>
                    </section>
                </main>
            </BrowserRouter>
        )
    }
}

export default PharmaPlusUIApp
