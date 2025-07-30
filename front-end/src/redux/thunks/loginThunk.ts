import axios, { AxiosError } from "axios";
import { initializeUserData } from "../slices/userSlice";
import type { User } from "../../types/types";
import type { User as FirebaseUser } from "firebase/auth";

export const loginThunk = (user: FirebaseUser | null) => async (dispatch: (arg0: { payload: User; type: `${string}/initializeUserData`; }) => void) => {

    const token = user && await user.getIdToken();
    const headers = token ? { authtoken: token } : {};

    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/profile`, { headers });
        const userData: User = response.data;

        dispatch(initializeUserData(userData));

        return { success: true };
    } catch (error) {
        return { success: false, error: (error as AxiosError).message };
    }
}