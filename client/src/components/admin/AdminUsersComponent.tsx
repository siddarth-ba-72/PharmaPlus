import { useAllUsersQuery } from '../../shared/queries/AdminQueries'
import { AdminUsersComponentView } from './AdminUsersComponentView'

export const AdminUsersComponent = () => {
    const usersQuery = useAllUsersQuery()

    return (
        <AdminUsersComponentView
            users={usersQuery.data ?? []}
            loading={usersQuery.isLoading}
            error={usersQuery.error instanceof Error ? usersQuery.error.message : null}
        />
    )
}
