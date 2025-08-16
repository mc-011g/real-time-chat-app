import { getAuth, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { loginThunk } from "../redux/thunks/loginThunk";
import { useAppDispatch } from "./useAppDispatch";
import { logoutUser } from "../redux/slices/userSlice";
import { clearMessages } from "../redux/slices/messagesSlice";
import { clearGroups } from "../redux/slices/groupsSlice";
import { socket } from "../socket";
import { useSelector } from "react-redux";
import { getUser } from "../redux/selectors";

export default function useUser() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);

    const userData = useSelector(getUser);

    const dispatch = useAppDispatch();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(getAuth(), function (user) {
            setUser(user);

            if (user) {
                socket.connect();
                const initializeUserState = async () => {
                    if (!userData || userData._id !== user.uid) {        
                        await dispatch(loginThunk(user));
                    }
                }
                initializeUserState();
            } else {
                dispatch(logoutUser());
                dispatch(clearMessages());
                dispatch(clearGroups());
                socket.disconnect();
            }

            setIsLoading(false);
        });

        return unsubscribe;
    }, [dispatch, userData]);

    return { isLoading, user };
}