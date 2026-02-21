import { Component } from 'react'
import { connect } from 'react-redux'
import { fetchUserProfileAction } from '../../redux-delegate/redux-actions/UserAuthActions'
import type { AppDispatch, RootState } from '../../redux-delegate/redux-store/ReduxStore'

type BaseComponentProps = {
    loading: boolean
    error: string | null
    isAuthenticated: boolean
    username: string | null
    fetchUserProfile: () => void
}

const mapStateToProps = (state: RootState) => ({
    loading: state.userAuth.loading,
    error: state.userAuth.error,
    isAuthenticated: state.userAuth.isAuthenticated,
    username: state.userAuth.username,
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    fetchUserProfile: () => dispatch(fetchUserProfileAction()),
})

class BaseComponent extends Component<BaseComponentProps> {
    componentDidMount(): void {
        this.props.fetchUserProfile()
    }

    render() {
        const { loading, error, isAuthenticated, username } = this.props

        if (loading) {
            return <p>Loading user profile...</p>
        }

        if (error) {
            return <p className="error-text">{error}</p>
        }

        if (isAuthenticated) {
            return <p>Welcome, {username}</p>
        }

        return <p>User is not authenticated.</p>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BaseComponent)
