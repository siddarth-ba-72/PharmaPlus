import { Component } from 'react'
import { Link } from 'react-router-dom'
import type { BannerComponentProps } from '../../component-models/props/PropModels'

class BannerComponent extends Component<BannerComponentProps> {
    render() {
        const { isAuthenticated, firstName, isDropdownOpen, onUserNameClick, onProfileClick, onLogoutClick } = this.props

        return (
            <header className="banner">
                <h1 className="banner-title">PharmaPlus</h1>
                {isAuthenticated ? (
                    <div className="banner-user-menu">
                        <button type="button" className="banner-user-btn" onClick={onUserNameClick}>
                            {firstName ?? 'User'}
                        </button>
                        {isDropdownOpen && (
                            <div className="banner-dropdown">
                                <button type="button" className="banner-dropdown-item" onClick={onProfileClick}>
                                    Profile
                                </button>
                                <button type="button" className="banner-dropdown-item" onClick={onLogoutClick}>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/pharma-plus/login" className="banner-login-btn">
                        Login
                    </Link>
                )}
            </header>
        )
    }
}

export default BannerComponent
