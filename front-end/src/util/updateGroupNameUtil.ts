import axios from "axios";
import type { User } from "firebase/auth";

export const updateGroupNameUtil = (user: User, name: string, groupId: string) => async () => {

    const token = user && await user.getIdToken();
    const headers = token ? { authtoken: token } : {};

    if (!user) {
        return;
    }

    try {
        await axios.put('/api/chat/group/' + groupId, {
            newName: name
        }, { headers });

        return { success: true };
    } catch (error) {

        if (axios.isAxiosError(error)) {
            return { success: false, error: error?.response?.data.error };
        } else {
            return { success: false, error: "An unexpected error occurred." };
        }
        
    }
}