import axios, { AxiosError } from "axios";
import type { User } from "../../types/types";
import { updateUserProfileData } from "../slices/userSlice";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";

export const fetchUserProfileDataThunk = () => async (dispatch: (arg0: { payload: User; type: `${string}/updateUserProfileData`; }) => void) => {

    const user = useContext(UserContext);
    const token = user && await user.getIdToken();
    const headers = token ? { authtoken: token } : {};

    if (!user) {
        return;
    }

    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/profile`, { headers });
        const userProfileData: User = response.data;
        dispatch(updateUserProfileData(userProfileData));

        return { success: true };
    } catch (error) {
        return { success: false, error: (error as AxiosError).message };
    }

}