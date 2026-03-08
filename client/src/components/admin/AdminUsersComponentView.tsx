import type { UserDto } from '../../shared/dto/UserDto'

type AdminUsersComponentViewProps = {
    users: UserDto[]
    loading: boolean
    error: string | null
}

export const AdminUsersComponentView = ({ users, loading, error }: AdminUsersComponentViewProps) => {
    if (loading) {
        return <section className="admin-wrapper">Loading users...</section>
    }

    if (error) {
        return <section className="admin-wrapper error-text">{error}</section>
    }

    return (
        <section className="admin-wrapper">
            <h2>All Users</h2>
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Age</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.username}>
                                <td>{user.username}</td>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.emailId}</td>
                                <td>{user.age}</td>
                                <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}
