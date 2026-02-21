import { Component, type ChangeEvent, type FormEvent } from 'react'
import { connect } from 'react-redux'
import ProfileComponent from './ProfileComponent'
import type { ProfileContainerProps } from '../../component-models/props/PropModels'
import type { ProfileContainerState } from '../../component-models/states/StateModels'
import type { AppDispatch, RootState } from '../../redux-delegate/redux-store/ReduxStore'
import { fetchUserProfileAction, updateUserAction } from '../../redux-delegate/redux-actions/UserAuthActions'

const mapStateToProps = (state: RootState): Pick<
    ProfileContainerProps,
    'username' | 'firstName' | 'lastName' | 'emailId' | 'age' | 'loading' | 'error'
> => ({
    username: state.userAuth.username,
    firstName: state.userAuth.firstName,
    lastName: state.userAuth.lastName,
    emailId: state.userAuth.emailId,
    age: state.userAuth.age,
    loading: state.userAuth.loading,
    error: state.userAuth.error,
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    fetchUserProfile: () => {
        dispatch(fetchUserProfileAction(true))
    },
    updateUser: async (payload: { firstName: string; lastName: string; emailId: string; age: number }) => {
        await dispatch(updateUserAction(payload)).unwrap()
    },
})

class ProfileContainer extends Component<ProfileContainerProps, ProfileContainerState> {
    constructor(props: ProfileContainerProps) {
        super(props)
        this.state = {
            isEditing: false,
            firstName: '',
            lastName: '',
            emailId: '',
            age: '',
            submitting: false,
            localError: null,
        }
    }

    componentDidMount(): void {
        this.props.fetchUserProfile()
    }

    private enterEditMode = (): void => {
        this.setState({
            isEditing: true,
            firstName: this.props.firstName ?? '',
            lastName: this.props.lastName ?? '',
            emailId: this.props.emailId ?? '',
            age: this.props.age === null ? '' : this.props.age.toString(),
            localError: null,
        })
    }

    private cancelEditMode = (): void => {
        this.setState({
            isEditing: false,
            localError: null,
        })
    }

    private handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target

        switch (name) {
            case 'firstName':
                this.setState({ firstName: value })
                break
            case 'lastName':
                this.setState({ lastName: value })
                break
            case 'age':
                this.setState({ age: value })
                break
            case 'emailId':
                this.setState({ emailId: value })
                break
            default:
                break
        }
    }

    private handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()

        const emailId = this.state.emailId
        if (!emailId) {
            this.setState({ localError: 'Email is missing for update operation.' })
            return
        }

        this.setState({ submitting: true, localError: null })
        try {
            await this.props.updateUser({
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                emailId,
                age: Number(this.state.age),
            })
            this.props.fetchUserProfile()
            this.setState({ isEditing: false, submitting: false })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Update failed'
            this.setState({ localError: errorMessage, submitting: false })
        }
    }

    render() {
        const username = this.props.username ?? ''
        const firstName = this.state.isEditing ? this.state.firstName : (this.props.firstName ?? '')
        const lastName = this.state.isEditing ? this.state.lastName : (this.props.lastName ?? '')
        const emailId = this.state.isEditing ? this.state.emailId : (this.props.emailId ?? '')
        const age = this.state.isEditing ? this.state.age : (this.props.age === null ? '' : this.props.age.toString())
        const error = this.state.localError ?? this.props.error

        return (
            <ProfileComponent
                username={username}
                firstName={firstName}
                lastName={lastName}
                emailId={emailId}
                age={age}
                isEditing={this.state.isEditing}
                submitting={this.state.submitting}
                error={error}
                onEditClick={this.enterEditMode}
                onCancelEdit={this.cancelEditMode}
                onInputChange={this.handleInputChange}
                onSubmit={this.handleSubmit}
            />
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileContainer)
