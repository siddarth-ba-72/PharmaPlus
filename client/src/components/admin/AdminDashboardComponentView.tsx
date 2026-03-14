import { Link } from 'react-router-dom'

const actions = [
    {
        title: 'See All Users',
        description: 'Inspect registered users and their profile data.',
        to: '/pharma-plus/admin/users',
    },
    {
        title: 'Add Medicine(s)',
        description: 'Create a new medicine entry for the catalog.',
        to: '/pharma-plus/admin/medicines/add',
    },
    {
        title: 'Update Medicine',
        description: 'Adjust medicine stock or price levels.',
        to: '/pharma-plus/admin/medicines/update-stock',
    },
    {
        title: 'Import Medicines',
        description: 'Upload Excel, validate rows, and preview medicine imports.',
        to: '/pharma-plus/admin/medicines/import',
    },
]

export const AdminDashboardComponentView = () => {
    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Admin Dashboard</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage catalog and operations from one place.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {actions.map((action) => (
                    <Link
                        key={action.to}
                        to={action.to}
                        className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/95 dark:hover:border-emerald-700"
                    >
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{action.title}</h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{action.description}</p>
                    </Link>
                ))}
            </div>
        </section>
    )
}
