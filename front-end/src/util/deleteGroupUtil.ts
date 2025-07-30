import axios from "axios";
import type { User } from "firebase/auth";

export const deleteGroupUtil = (user: User, groupId: string) => async () => {
    const token = user && await user.getIdToken();
    const headers = token ? { authtoken: token } : {};

    if (!user) {
        return;
    }

    try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/chat/group/${groupId}`, { headers });
        return { success: true };
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return { success: false, error: error?.response?.data.error };
        } else {
            return { success: false, error: "An unexpected error occurred." };
        }
    }
}