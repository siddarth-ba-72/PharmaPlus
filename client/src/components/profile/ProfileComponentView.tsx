import type { ProfileComponentProps } from '../../shared/props/PropModels'

export const ProfileComponentView = (props: ProfileComponentProps) => {
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
    } = props

    if (!isEditing) {
        return (
            <section className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/95">
                <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">My Profile</h2>
                {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-200">{error}</p>}
                <div className="grid grid-cols-1 gap-2 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
                    <p><strong>Username:</strong> {username}</p>
                    <p><strong>Email:</strong> {emailId}</p>
                    <p><strong>First Name:</strong> {firstName}</p>
                    <p><strong>Last Name:</strong> {lastName}</p>
                    <p><strong>Age:</strong> {age}</p>
                </div>
                <button type="button" onClick={onEditClick} className="mt-5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                    Edit Details
                </button>
            </section>
        )
    }

    return (
        <section className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/95">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Edit Profile</h2>
            {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-200">{error}</p>}
            <form className="grid gap-3" onSubmit={onSubmit}>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="username">Username</label>
                <input id="username" name="username" value={username} disabled className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" />

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="firstName">First Name</label>
                <input id="firstName" name="firstName" value={firstName} onChange={onInputChange} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="lastName">Last Name</label>
                <input id="lastName" name="lastName" value={lastName} onChange={onInputChange} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="emailId">Email</label>
                <input id="emailId" name="emailId" type="email" value={emailId} onChange={onInputChange} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="age">Age</label>
                <input id="age" name="age" type="number" value={age} onChange={onInputChange} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />

                <div className="mt-2 flex gap-2">
                    <button type="button" onClick={onCancelEdit} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70">
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </section>
    )
}
