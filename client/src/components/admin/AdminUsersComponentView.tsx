import type { UserDto } from '../../shared/dto/UserDto'
import { Link } from 'react-router-dom'

type AdminUsersComponentViewProps = {
    users: UserDto[]
    loading: boolean
    error: string | null
}

export const AdminUsersComponentView = ({ users, loading, error }: AdminUsersComponentViewProps) => {
    if (loading) {
        return <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Loading users...</section>
    }

    if (error) {
        return <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">{error}</section>
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/95">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">All Users</h2>
                <Link
                    to="/pharma-plus/admin"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                >
                    Back to Dashboard
                </Link>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="min-w-[720px] w-full border-collapse text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                            <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Username</th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">First Name</th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Last Name</th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Email</th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Age</th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.username} className="border-t border-slate-200 dark:border-slate-700">
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{user.username}</td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{user.firstName}</td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{user.lastName}</td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{user.emailId}</td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{user.age}</td>
                                <td className="px-3 py-2">
                                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${user.isAdmin ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
                                        {user.isAdmin ? 'Admin' : 'User'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}
