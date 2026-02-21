import { Component } from 'react'
import type { ProfileComponentProps } from '../../component-models/props/PropModels'

class ProfileComponent extends Component<ProfileComponentProps> {
    render() {
        const {
            username,
            firstName,
            lastName,
            emailId,
            age,
            isEditing,
            submitting,
            error,
            onEditClick,
            onCancelEdit,
            onInputChange,
            onSubmit,
        } = this.props

        if (!isEditing) {
            return (
                <section className="profile-wrapper">
                    <div className="profile-card">
                        <h2>Profile</h2>
                        {error && <p className="error-text">{error}</p>}
                        <p><strong>Username:</strong> {username}</p>
                        <p><strong>First Name:</strong> {firstName}</p>
                        <p><strong>Last Name:</strong> {lastName}</p>
                        <p><strong>Email Id:</strong> {emailId}</p>
                        <p><strong>Age:</strong> {age}</p>
                        <button type="button" onClick={onEditClick}>
                            Edit Details
                        </button>
                    </div>
                </section>
            )
        }

        return (
            <section className="profile-wrapper">
                <div className="profile-card">
                    <h2>Edit Profile</h2>
                    {error && <p className="error-text">{error}</p>}
                    <form className="profile-form" onSubmit={onSubmit}>
                        <label htmlFor="username">Username</label>
                        <input id="username" name="username" value={username} disabled />

                        <label htmlFor="firstName">First Name</label>
                        <input id="firstName" name="firstName" value={firstName} onChange={onInputChange} required />

                        <label htmlFor="lastName">Last Name</label>
                        <input id="lastName" name="lastName" value={lastName} onChange={onInputChange} required />

                        <label htmlFor="emailId">Email Id</label>
                        <input id="emailId" name="emailId" type="email" value={emailId} onChange={onInputChange} required />

                        <label htmlFor="age">Age</label>
                        <input id="age" name="age" type="number" value={age} onChange={onInputChange} required />

                        <div className="profile-actions">
                            <button type="button" onClick={onCancelEdit}>
                                Cancel
                            </button>
                            <button type="submit" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        )
    }
}

export default ProfileComponent
