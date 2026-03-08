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
        <section className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/95">
                <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
                    {mode === 'login'
                        ? 'Login to continue shopping medicines.'
                        : 'Register to save cart items and place orders.'}
                </p>

                {mode === 'login' ? (
                    <form className="grid gap-3" onSubmit={onLoginSubmit}>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="userName">Username</label>
                        <input
                            id="userName"
                            name="userName"
                            value={userName}
                            onChange={onInputChange}
                            required
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={onInputChange}
                            required
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70"
                        >
                            {submitting ? 'Submitting...' : 'Sign In'}
                        </button>
                    </form>
                ) : (
                    <form className="grid gap-3" onSubmit={onRegisterSubmit}>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="userName">Username</label>
                        <input id="userName" name="userName" value={userName} onChange={onInputChange} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="firstName">First Name</label>
                        <input id="firstName" name="firstName" value={firstName} onChange={onInputChange} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="lastName">Last Name</label>
                        <input id="lastName" name="lastName" value={lastName} onChange={onInputChange} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="emailId">Email</label>
                        <input id="emailId" name="emailId" type="email" value={emailId} onChange={onInputChange} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="password">Password</label>
                        <input id="password" name="password" type="password" value={password} onChange={onInputChange} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="age">Age</label>
                        <input id="age" name="age" type="number" value={age} onChange={onInputChange} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                        <button type="submit" disabled={submitting} className="mt-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70">
                            {submitting ? 'Submitting...' : 'Create Account'}
                        </button>
                    </form>
                )}

                <button
                    type="button"
                    className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                    onClick={onToggleMode}
                >
                    {mode === 'login' ? 'Switch to Register' : 'Switch to Login'}
                </button>
            </div>
        </section>
    )
}
