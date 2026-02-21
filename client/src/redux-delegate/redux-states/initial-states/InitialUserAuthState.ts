import type { UserAuthState } from "../state-models/UserAuthState";

export const initialUserAuthState: UserAuthState = {
    isAuthenticated: false,
    username: null,
    firstName: null,
    lastName: null,
    emailId: null,
    age: null,
    loading: false,
    error: null,
    isInitialized: false,
}
