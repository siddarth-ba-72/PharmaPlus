import { Component, type ChangeEvent, type FormEvent } from 'react'
import { connect } from 'react-redux'
import { Navigate } from 'react-router-dom'
import AuthComponent from './AuthComponent'
import type { AppDispatch, RootState } from '../../redux-delegate/redux-store/ReduxStore'
import { fetchUserProfileAction, loginUserAction, registerUserAction } from '../../redux-delegate/redux-actions/UserAuthActions'
import type { LoginRequestDto } from '../../shared/dto/LoginRequestDto'
import type { RegisterRequestDto } from '../../shared/dto/RegisterRequestDto'
import type { AuthContainerProps } from '../../component-models/props/PropModels'
import type { AuthContainerState } from '../../component-models/states/StateModels'
import { setUserAuthField } from '../../redux-delegate/redux-state-managers/UserAuthStateManager'

const mapStateToProps = (state: RootState): Pick<AuthContainerProps, 'username' | 'firstName' | 'lastName' | 'emailId' | 'age'> => ({
    username: state.userAuth.username,
    firstName: state.userAuth.firstName,
    lastName: state.userAuth.lastName,
    emailId: state.userAuth.emailId,
    age: state.userAuth.age,
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    setAuthField: (
        field: 'username' | 'firstName' | 'lastName' | 'emailId' | 'age',
        value: string | number | null,
    ) => {
        dispatch(setUserAuthField({ field, value }))
    },
    fetchUserProfile: () => {
        dispatch(fetchUserProfileAction(true))
    },
    loginUser: async (request: LoginRequestDto) => {
        await dispatch(loginUserAction(request)).unwrap()
    },
    registerUser: async (request: RegisterRequestDto) => {
        await dispatch(registerUserAction(request)).unwrap()
    },
})

class AuthContainer extends Component<AuthContainerProps, AuthContainerState> {
    constructor(props: AuthContainerProps) {
        super(props)
        this.state = {
            mode: 'login',
            password: '',
            submitting: false,
            error: null,
            redirectToHome: false,
        }
    }

    private handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target

        switch (name) {
            case 'userName':
                this.props.setAuthField('username', value)
                break
            case 'password':
                this.setState({ password: value })
                break
            case 'firstName':
                this.props.setAuthField('firstName', value)
                break
            case 'lastName':
                this.props.setAuthField('lastName', value)
                break
            case 'emailId':
                this.props.setAuthField('emailId', value)
                break
            case 'age':
                this.props.setAuthField('age', value === '' ? null : Number(value))
                break
            default:
                break
        }
    }

    private toggleMode = (): void => {
        this.setState((prevState) => ({
            mode: prevState.mode === 'login' ? 'register' : 'login',
            error: null,
        }))
    }

    private submitLogin = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        const { password } = this.state
        const userName = this.props.username ?? ''

        this.setState({ submitting: true, error: null })
        try {
            await this.props.loginUser({ userName, password })
            this.props.fetchUserProfile()
            this.setState({ redirectToHome: true, submitting: false })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed'
            this.setState({ error: errorMessage, submitting: false })
        }
    }

    private submitRegister = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        const { password } = this.state
        const userName = this.props.username ?? ''
        const firstName = this.props.firstName ?? ''
        const lastName = this.props.lastName ?? ''
        const emailId = this.props.emailId ?? ''
        const age = this.props.age ?? 0

        this.setState({ submitting: true, error: null })
        try {
            await this.props.registerUser({
                userName,
                firstName,
                lastName,
                emailId,
                password,
                age,
            })
            this.props.fetchUserProfile()
            this.setState({ redirectToHome: true, submitting: false })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed'
            this.setState({ error: errorMessage, submitting: false })
        }
    }

    render() {
        const { mode, password, submitting, error, redirectToHome } = this.state
        const userName = this.props.username ?? ''
        const firstName = this.props.firstName ?? ''
        const lastName = this.props.lastName ?? ''
        const emailId = this.props.emailId ?? ''
        const age = this.props.age === null ? '' : this.props.age.toString()

        if (redirectToHome) {
            return <Navigate to="/pharma-plus/home" replace />
        }

        return (
            <AuthComponent
                mode={mode}
                userName={userName}
                password={password}
                firstName={firstName}
                lastName={lastName}
                emailId={emailId}
                age={age}
                submitting={submitting}
                error={error}
                onInputChange={this.handleInputChange}
                onToggleMode={this.toggleMode}
                onLoginSubmit={this.submitLogin}
                onRegisterSubmit={this.submitRegister}
            />
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthContainer)
