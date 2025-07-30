import { createContext, type ReactNode } from "react";
import useUser from "../hooks/useUser";
import { type User } from "firebase/auth";

export const UserContext = createContext<User | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {

    const { user, isLoading } = useUser();

    if (isLoading) {
        return <div>Loading...</div>
    }

    return <UserContext.Provider value={user}>
        {children}
    </UserContext.Provider>
}