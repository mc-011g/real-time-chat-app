import axios from "axios";
import type { MessageType } from "../types/types";
import type { User } from "firebase/auth";

export const createMessageUtil = (user: User, message: MessageType) => async () => {

    const token = user && await user.getIdToken();
    const headers = token ? { authtoken: token } : {};

    if (!user) {
        return;
    }

    try {
        await axios.post('/api/chat/group/' + message.groupId + '/send-message', { message }, { headers });
        return { success: true };
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return { success: false, error: error?.response?.data.error };
        } else {
            return { success: false, error: "An unexpected error occurred." };
        }
    }
}