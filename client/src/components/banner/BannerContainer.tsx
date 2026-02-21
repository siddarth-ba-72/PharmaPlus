import { Component } from 'react'
import { connect } from 'react-redux'
import { Navigate } from 'react-router-dom'
import BannerComponent from './BannerComponent'
import type { BannerComponentProps, BannerContainerProps } from '../../component-models/props/PropModels'
import type { AppDispatch, RootState } from '../../redux-delegate/redux-store/ReduxStore'
import { logoutUserAction } from '../../redux-delegate/redux-actions/UserAuthActions'
import type { BannerContainerState } from '../../component-models/states/StateModels'

const mapStateToProps = (state: RootState): Pick<BannerContainerProps, 'isAuthenticated' | 'firstName'> => ({
    isAuthenticated: state.userAuth.isAuthenticated,
    firstName: state.userAuth.firstName,
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    logoutUser: async () => {
        await dispatch(logoutUserAction()).unwrap()
    },
})

class BannerContainer extends Component<BannerContainerProps, BannerContainerState> {
    constructor(props: BannerContainerProps) {
        super(props)
        this.state = {
            isDropdownOpen: false,
            redirectToHome: false,
        }
    }

    private toggleDropdown = (): void => {
        this.setState((prevState) => ({ isDropdownOpen: !prevState.isDropdownOpen }))
    }

    private handleLogout = async (): Promise<void> => {
        try {
            await this.props.logoutUser()
            this.setState({ isDropdownOpen: false, redirectToHome: true })
        } catch {
            this.setState({ isDropdownOpen: false })
        }
    }

    componentDidUpdate(_: BannerContainerProps, prevState: BannerContainerState): void {
        if (!prevState.redirectToHome && this.state.redirectToHome) {
            this.setState({ redirectToHome: false })
        }
    }

    render() {
        const bannerProps: BannerComponentProps = {
            isAuthenticated: this.props.isAuthenticated,
            firstName: this.props.firstName,
            isDropdownOpen: this.state.isDropdownOpen,
            onUserNameClick: this.toggleDropdown,
            onLogoutClick: this.handleLogout,
        }

        return (
            <>
                {this.state.redirectToHome && <Navigate to="/pharma-plus/home" replace />}
                <BannerComponent {...bannerProps} />
            </>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BannerContainer)
