import axios from "axios";
import { updateUserProfileData } from "../slices/userSlice";
import type { User } from "../../types/types";
import type { User as FirebaseUser } from "firebase/auth";

export const updateUserProfileDataThunk = (user: FirebaseUser, formData: User) => async (dispatch: (arg0: { payload: User | { groupIds: string[]; participant: User; }; type: `${string}/updateUserProfileData` | `${string}/updateSelectedGroupParticipant`; }) => void) => {

    const token = user && await user.getIdToken();
    const headers = token ? { authtoken: token } : {};
    const { email, firstName, lastName } = formData;

    if (!user) {
        return;
    }

    try {
        const response = await axios.put('/api/user/profile', {
            email,
            firstName,
            lastName
        }, { headers });

        const userData: User = response.data;

        dispatch(updateUserProfileData(userData));

        return { success: true, user: userData };

    } catch (error) {
        if (axios.isAxiosError(error)) {
            return { success: false, error: error?.response?.data.error };
        } else {
            return { success: false, error: "An unexpected error occurred." };
        }
    }
}