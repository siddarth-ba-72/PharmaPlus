import type { AuthComponentProps } from '../../shared/props/PropModels'

export const AuthComponentView = (props: AuthComponentProps) => {
    const {
        mode,
        userName,
        password,
        firstName,
        lastName,
        emailId,
        age,
        submitting,
        onInputChange,
        onToggleMode,
        onLoginSubmit,
        onRegisterSubmit,
    } = props

    return (
        <section className="auth-wrapper">
            <div className="auth-card">
                <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
                {mode === 'register' && (
                    <p className="auth-warning">
                        Username cannot be changed after registration.
                    </p>
                )}

                {mode === 'login' ? (
                    <form className="auth-form" onSubmit={onLoginSubmit}>
                        <label htmlFor="userName">Username</label>
                        <input id="userName" name="userName" value={userName} onChange={onInputChange} required />

                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={onInputChange}
                            required
                        />

                        <button type="submit" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </form>
                ) : (
                    <form className="auth-form" onSubmit={onRegisterSubmit}>
                        <label htmlFor="userName">Username</label>
                        <input id="userName" name="userName" value={userName} onChange={onInputChange} required />

                        <label htmlFor="firstName">First Name</label>
                        <input id="firstName" name="firstName" value={firstName} onChange={onInputChange} required />

                        <label htmlFor="lastName">Last Name</label>
                        <input id="lastName" name="lastName" value={lastName} onChange={onInputChange} required />

                        <label htmlFor="emailId">Email Id</label>
                        <input id="emailId" name="emailId" type="email" value={emailId} onChange={onInputChange} required />

                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={onInputChange}
                            required
                        />

                        <label htmlFor="age">Age</label>
                        <input id="age" name="age" type="number" value={age} onChange={onInputChange} required />

                        <button type="submit" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </form>
                )}

                <button type="button" className="auth-toggle-btn" onClick={onToggleMode}>
                    {mode === 'login' ? 'Switch to Register' : 'Switch to Login'}
                </button>
            </div>
        </section>
    )
}
