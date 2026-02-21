import type { AbstractState } from "../AbstractState"

export interface UserAuthState extends AbstractState {
    isAuthenticated: boolean
    username: string | null
    firstName: string | null
    lastName: string | null
    emailId: string | null
    age: number | null
}
