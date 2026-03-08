import { Link } from 'react-router-dom'

export const AdminDashboardComponentView = () => {
    return (
        <section className="admin-wrapper">
            <h2>Admin Dashboard</h2>
            <div className="admin-actions-grid">
                <Link to="/pharma-plus/admin/users" className="admin-action-card">
                    <h3>See All Users</h3>
                    <p>View complete user list and profile details.</p>
                </Link>
                <Link to="/pharma-plus/admin/medicines/add" className="admin-action-card">
                    <h3>Add Medicine(s)</h3>
                    <p>Create a new medicine record.</p>
                </Link>
                <Link to="/pharma-plus/admin/medicines/update-stock" className="admin-action-card">
                    <h3>Update Medicine</h3>
                    <p>Update medicine stock quantity or price.</p>
                </Link>
            </div>
        </section>
    )
}
