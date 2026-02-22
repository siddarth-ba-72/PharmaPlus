import type { BannerComponentProps } from '../../shared/props/PropModels'
import { Link } from 'react-router-dom'

export const BannerComponentView = (props: BannerComponentProps) => {

    const { isAuthenticated, firstName, isDropdownOpen, onUserNameClick, onProfileClick, onLogoutClick } = props

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
    );
};